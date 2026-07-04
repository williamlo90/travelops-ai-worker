from datetime import date
from pathlib import Path

import pytest
from sqlalchemy import func, select

from app.persistence.database import Database
from app.persistence.models import PolicyDocumentVersionModel
from app.retrieval.ingest import ingest_policy
from app.retrieval.retriever import PolicyRetriever


def test_ingestion_is_idempotent_and_published_version_is_immutable(
    database: Database,
    tmp_path: Path,
) -> None:
    source = Path(__file__).resolve().parents[2] / "policies" / "source" / "refund-policy-v1.json"
    ingest_policy(database, source)
    ingest_policy(database, source)
    with database.session() as session:
        assert session.scalar(select(func.count()).select_from(PolicyDocumentVersionModel)) == 1

    changed = tmp_path / "changed.json"
    changed.write_text(source.read_text().replace("without a cancellation fee", "for cash"))
    with pytest.raises(ValueError, match="cannot be replaced"):
        ingest_policy(database, changed)


def test_inapplicable_metadata_abstains_before_vector_ranking(database: Database) -> None:
    # Proposal identity is intentionally invalid here: abstention must happen before evidence write.
    results = PolicyRetriever(database).retrieve_and_bind(
        proposal_id=__import__("uuid").uuid4(),
        query="carrier cancelled full refund",
        carrier="Other Airline",
        product="flight",
        jurisdiction="SG",
        as_of=date(2026, 7, 5),
    )
    assert results == []


def test_stale_policy_abstains(database: Database) -> None:
    results = PolicyRetriever(database).retrieve_and_bind(
        proposal_id=__import__("uuid").uuid4(),
        query="carrier cancelled full refund",
        carrier="British Airways",
        product="flight",
        jurisdiction="SG",
        as_of=date(2025, 12, 31),
    )
    assert results == []


def test_conflicting_active_documents_abstain(database: Database, tmp_path: Path) -> None:
    source = Path(__file__).resolve().parents[2] / "policies" / "source" / "refund-policy-v1.json"
    conflict = tmp_path / "conflict.json"
    conflict.write_text(
        source.read_text()
        .replace('"source_id": "POL-REFUND"', '"source_id": "POL-CONFLICT"')
        .replace('"version": 1', '"version": 2')
    )
    ingest_policy(database, conflict)

    results = PolicyRetriever(database).retrieve_and_bind(
        proposal_id=__import__("uuid").uuid4(),
        query="carrier cancelled full refund",
        carrier="British Airways",
        product="flight",
        jurisdiction="SG",
        as_of=date(2026, 7, 5),
    )
    assert results == []
