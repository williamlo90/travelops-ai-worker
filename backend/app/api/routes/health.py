from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel


class LiveResponse(BaseModel):
    status: Literal["alive"]
    service: str


class DependencyStatus(BaseModel):
    status: Literal["not_configured"]


class ReadyDependencies(BaseModel):
    database: DependencyStatus


class ReadyResponse(BaseModel):
    status: Literal["ready"]
    service: str
    dependencies: ReadyDependencies


def create_health_router(service_name: str) -> APIRouter:
    router = APIRouter(prefix="/api/health", tags=["health"])

    @router.get("/live", response_model=LiveResponse)
    async def live() -> LiveResponse:
        return LiveResponse(status="alive", service=service_name)

    @router.get("/ready", response_model=ReadyResponse)
    async def ready() -> ReadyResponse:
        return ReadyResponse(
            status="ready",
            service=service_name,
            dependencies=ReadyDependencies(database=DependencyStatus(status="not_configured")),
        )

    return router
