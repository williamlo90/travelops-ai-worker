from app.config import Settings
from app.persistence.checkpoints import setup_checkpoint_schema


def main() -> None:
    settings = Settings()
    if not settings.database_url:
        raise RuntimeError("TRAVELOPS_DATABASE_URL is required to set up checkpoints.")
    setup_checkpoint_schema(settings.database_url)


if __name__ == "__main__":
    main()
