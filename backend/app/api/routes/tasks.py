from fastapi import APIRouter, Query, Request

from app.api.errors import AppError
from app.api.schemas.tasks import TaskDetailResponse, TaskListResponse
from app.persistence.database import Database
from app.services.task_read_service import TaskReadService

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def _service(request: Request) -> TaskReadService:
    database: Database | None = request.app.state.database
    if database is None:
        raise AppError(
            code="database_not_configured",
            message="Task data is not available.",
            status_code=503,
        )
    return TaskReadService(database)


@router.get("", response_model=TaskListResponse)
def list_tasks(
    request: Request,
    status: str | None = None,
    type: str | None = None,
    query: str | None = None,
    sort: str = Query(default="priority", pattern="^(priority|sla_asc|exposure_desc)$"),
    cursor: str | None = None,
    limit: int = Query(default=50, ge=1, le=100),
) -> TaskListResponse:
    try:
        return _service(request).list_tasks(
            status=status,
            task_type=type,
            query=query,
            sort=sort,
            cursor=cursor,
            limit=limit,
        )
    except ValueError as exc:
        raise AppError(code="invalid_cursor", message=str(exc), status_code=400) from exc


@router.get("/{task_id}", response_model=TaskDetailResponse)
def get_task(task_id: str, request: Request) -> TaskDetailResponse:
    result = _service(request).get_task(task_id)
    if result is None:
        raise AppError(
            code="task_not_found",
            message=f"Task {task_id} was not found.",
            status_code=404,
        )
    return result
