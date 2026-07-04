import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.errors import register_error_handlers
from app.api.middleware import register_http_middleware
from app.api.routes.health import create_health_router
from app.api.routes.orchestration import router as orchestration_router
from app.api.routes.tasks import router as tasks_router
from app.config import Settings, get_settings
from app.logging import configure_logging
from app.models.deterministic import DeterministicModelGateway
from app.persistence.database import Database


def create_app(settings: Settings | None = None) -> FastAPI:
    runtime_settings = settings or get_settings()
    configure_logging(runtime_settings)
    logger = logging.getLogger(__name__)
    database = Database(runtime_settings.database_url) if runtime_settings.database_url else None

    @asynccontextmanager
    async def lifespan(_: FastAPI) -> AsyncIterator[None]:
        logger.info("application_started", extra=runtime_settings.safe_log_context())
        yield
        if database:
            database.dispose()
        logger.info("application_stopped", extra={"service": runtime_settings.service_name})

    app = FastAPI(
        title="TravelOps AI Worker API",
        version="0.1.0",
        lifespan=lifespan,
    )
    register_http_middleware(app)
    register_error_handlers(app)
    app.state.database = database
    app.state.model_gateway = DeterministicModelGateway()
    app.include_router(
        create_health_router(
            runtime_settings.service_name,
            database_check=database.is_ready if database else None,
        )
    )
    app.include_router(tasks_router)
    app.include_router(orchestration_router)
    return app


app = create_app()
