import pytest
from pydantic import ValidationError

from app.config import Settings


def test_settings_use_safe_local_defaults() -> None:
    settings = Settings(_env_file=None)

    assert settings.environment == "development"
    assert settings.api_port == 8000
    assert settings.safe_log_context() == {
        "service": "travelops-api",
        "environment": "development",
        "log_level": "INFO",
        "api_host": "127.0.0.1",
        "api_port": 8000,
    }


@pytest.mark.parametrize(
    ("field", "value"),
    [
        ("environment", "staging"),
        ("log_level", "VERBOSE"),
        ("api_port", 0),
        ("api_port", 65536),
    ],
)
def test_invalid_configuration_fails_explicitly(field: str, value: object) -> None:
    with pytest.raises(ValidationError):
        Settings(_env_file=None, **{field: value})  # type: ignore[arg-type]
