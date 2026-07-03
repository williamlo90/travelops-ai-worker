from fastapi.testclient import TestClient

from app.config import Settings
from app.main import create_app


def test_application_lifespan_boots() -> None:
    app = create_app(Settings(environment="test", _env_file=None))

    with TestClient(app) as client:
        assert client.get("/api/health/live").status_code == 200
