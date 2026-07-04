from pathlib import Path

from app.config import Settings
from app.evaluation.retrieval import run_retrieval_benchmark
from app.persistence.database import Database


def main() -> None:
    settings = Settings()
    if not settings.database_url:
        raise RuntimeError("TRAVELOPS_DATABASE_URL is required.")
    database = Database(settings.database_url)
    try:
        dataset = Path(__file__).resolve().parents[1] / "evaluations" / "retrieval" / "golden.json"
        metrics = run_retrieval_benchmark(database, dataset)
        print(f"cases={metrics.cases} recall_at_3={metrics.recall_at_3:.3f} mrr={metrics.mrr:.3f}")
        if metrics.recall_at_3 < 1.0:
            raise SystemExit(1)
    finally:
        database.dispose()


if __name__ == "__main__":
    main()
