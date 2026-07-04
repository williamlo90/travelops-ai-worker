from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class RetrievalEvidenceRecord(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    proposal_id: UUID
    policy_version_id: UUID
    chunk_id: UUID
    source_id: str
    clause: str
    excerpt: str
    content_hash: str
    effective_from: date
    retrieval_score: float
    corpus_version: str
    chunking_version: str
    embedding_version: str
    index_version: str
    created_at: datetime


class PolicyDocumentVersionRecord(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    source_id: str
    version: int
    title: str
    carrier: str
    product: str
    jurisdiction: str
    effective_from: date
    effective_to: date | None
    lifecycle_status: str
    content_hash: str
    corpus_version: str
    created_at: datetime
