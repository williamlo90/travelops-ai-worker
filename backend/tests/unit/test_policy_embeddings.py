import pytest

from app.retrieval.embeddings import EMBEDDING_DIMENSIONS, embed


def test_embedding_is_deterministic_normalized_and_fixed_size() -> None:
    first = embed("carrier cancelled flight refund")
    second = embed("carrier cancelled flight refund")

    assert first == second
    assert len(first) == EMBEDDING_DIMENSIONS
    assert sum(value * value for value in first) == pytest.approx(1.0)


def test_unrelated_queries_do_not_share_identical_vectors() -> None:
    assert embed("carrier cancellation refund") != embed("hotel breakfast benefit")
