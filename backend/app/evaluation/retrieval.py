import json
from dataclasses import dataclass
from pathlib import Path

from sqlalchemy import select

from app.persistence.database import Database
from app.persistence.models import PolicyChunkModel, PolicyDocumentVersionModel
from app.retrieval.embeddings import embed


@dataclass(frozen=True)
class RetrievalMetrics:
    cases: int
    recall_at_3: float
    mrr: float


def run_retrieval_benchmark(database: Database, dataset: Path) -> RetrievalMetrics:
    cases: list[dict[str, str]] = json.loads(dataset.read_text())
    hits = 0
    reciprocal_rank = 0.0
    with database.session() as session:
        for case in cases:
            distance = PolicyChunkModel.embedding.cosine_distance(embed(case["query"]))
            clauses = list(
                session.scalars(
                    select(PolicyChunkModel.clause)
                    .join(
                        PolicyDocumentVersionModel,
                        PolicyDocumentVersionModel.id == PolicyChunkModel.policy_version_id,
                    )
                    .where(
                        PolicyDocumentVersionModel.lifecycle_status == "active",
                        PolicyDocumentVersionModel.carrier == case["carrier"],
                        PolicyDocumentVersionModel.jurisdiction == case["jurisdiction"],
                    )
                    .order_by(distance)
                    .limit(3)
                )
            )
            expected = case["relevant_clause"]
            if expected in clauses:
                rank = clauses.index(expected) + 1
                hits += 1
                reciprocal_rank += 1 / rank
    count = len(cases)
    return RetrievalMetrics(
        cases=count,
        recall_at_3=hits / count if count else 0.0,
        mrr=reciprocal_rank / count if count else 0.0,
    )
