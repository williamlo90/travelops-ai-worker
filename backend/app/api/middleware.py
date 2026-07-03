import logging
import re
from time import perf_counter
from uuid import uuid4

from fastapi import FastAPI, Request, Response
from starlette.middleware.base import RequestResponseEndpoint

CORRELATION_HEADER = "X-Correlation-ID"
_VALID_CORRELATION_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$")
logger = logging.getLogger(__name__)


def _resolve_correlation_id(candidate: str | None) -> str:
    if candidate and _VALID_CORRELATION_ID.fullmatch(candidate):
        return candidate
    return f"corr_{uuid4().hex}"


def register_http_middleware(app: FastAPI) -> None:
    @app.middleware("http")
    async def correlation_middleware(
        request: Request, call_next: RequestResponseEndpoint
    ) -> Response:
        correlation_id = _resolve_correlation_id(request.headers.get(CORRELATION_HEADER))
        request.state.correlation_id = correlation_id
        started_at = perf_counter()

        response = await call_next(request)
        response.headers[CORRELATION_HEADER] = correlation_id
        logger.info(
            "request_completed",
            extra={
                "correlation_id": correlation_id,
                "method": request.method,
                "path": request.url.path,
                "status_code": response.status_code,
                "duration_ms": round((perf_counter() - started_at) * 1000, 2),
            },
        )
        return response
