from datetime import date
from uuid import UUID

from sqlalchemy import select

from app.domain.policies import PolicyDocumentVersionRecord, RetrievalEvidenceRecord
from app.persistence.database import Database
from app.persistence.models import (
    PolicyChunkModel,
    PolicyDocumentVersionModel,
    ProposalVersionModel,
    RetrievalEvidenceModel,
)
from app.retrieval.embeddings import embed


class PolicyRetriever:
    def __init__(self, database: Database) -> None:
        self.database = database

    def retrieve_and_bind(
        self,
        *,
        proposal_id: UUID,
        query: str,
        carrier: str,
        product: str,
        jurisdiction: str,
        as_of: date,
    ) -> list[RetrievalEvidenceRecord]:
        with self.database.session() as session:
            distance = PolicyChunkModel.embedding.cosine_distance(embed(query))
            rows = session.execute(
                select(PolicyChunkModel, PolicyDocumentVersionModel, distance.label("distance"))
                .join(
                    PolicyDocumentVersionModel,
                    PolicyDocumentVersionModel.id == PolicyChunkModel.policy_version_id,
                )
                .where(
                    PolicyDocumentVersionModel.lifecycle_status == "active",
                    PolicyDocumentVersionModel.carrier == carrier,
                    PolicyDocumentVersionModel.product == product,
                    PolicyDocumentVersionModel.jurisdiction == jurisdiction,
                    PolicyDocumentVersionModel.effective_from <= as_of,
                    (
                        PolicyDocumentVersionModel.effective_to.is_(None)
                        | (PolicyDocumentVersionModel.effective_to >= as_of)
                    ),
                )
                .order_by(distance)
                .limit(3)
            ).all()
            if not rows:
                return []
            if len({row[1].id for row in rows}) > 1:
                return []
            chunk, document, raw_distance = rows[0]
            score = 1.0 - float(raw_distance)
            if score < 0.15:
                return []
            evidence = RetrievalEvidenceModel(
                proposal_id=proposal_id,
                policy_version_id=document.id,
                chunk_id=chunk.id,
                source_id=document.source_id,
                clause=chunk.clause,
                excerpt=chunk.text,
                content_hash=chunk.content_hash,
                effective_from=document.effective_from,
                retrieval_score=score,
                corpus_version=document.corpus_version,
                chunking_version=chunk.chunking_version,
                embedding_version=chunk.embedding_version,
                index_version=chunk.index_version,
            )
            session.add(evidence)
            proposal = session.get(ProposalVersionModel, proposal_id)
            if proposal is None:
                raise LookupError(f"Proposal {proposal_id} does not exist.")
            proposal.status = "waiting_approval"
            session.flush()
            return [RetrievalEvidenceRecord.model_validate(evidence)]

    def list_for_proposal(self, proposal_id: UUID) -> list[RetrievalEvidenceRecord]:
        with self.database.session() as session:
            rows = session.scalars(
                select(RetrievalEvidenceModel).where(
                    RetrievalEvidenceModel.proposal_id == proposal_id
                )
            )
            return [RetrievalEvidenceRecord.model_validate(row) for row in rows]

    def get_policy(self, source_id: str, version: int) -> PolicyDocumentVersionRecord | None:
        with self.database.session() as session:
            model = session.scalar(
                select(PolicyDocumentVersionModel).where(
                    PolicyDocumentVersionModel.source_id == source_id,
                    PolicyDocumentVersionModel.version == version,
                )
            )
            return PolicyDocumentVersionRecord.model_validate(model) if model else None
