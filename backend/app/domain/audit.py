from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class AuditEventRecord(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    task_id: UUID
    run_id: UUID | None
    event_type: str
    actor_type: str
    data: dict[str, Any]
    correlation_id: str
    occurred_at: datetime
