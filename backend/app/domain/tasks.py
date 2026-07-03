from datetime import datetime, timedelta
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class TaskType(StrEnum):
    REFUND = "refund"


class RequestChannel(StrEnum):
    EMAIL = "email"
    CHAT = "chat"
    PHONE = "phone"


class TaskCreate(BaseModel):
    public_id: str = Field(pattern=r"^RF-\d{4}$")
    task_type: TaskType = TaskType.REFUND
    customer_message: str = Field(min_length=1)
    channel: RequestChannel
    received_at: datetime
    correlation_id: str = Field(min_length=1, max_length=128)

    @field_validator("received_at")
    @classmethod
    def require_utc(cls, value: datetime) -> datetime:
        if value.utcoffset() != timedelta(0):
            raise ValueError("received_at must be timezone-aware UTC")
        return value


class TaskRecord(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    public_id: str
    task_type: TaskType
    status: str
    version: int
    created_at: datetime
    updated_at: datetime


class RequestRecord(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    task_id: UUID
    channel: RequestChannel
    customer_message: str
    received_at: datetime
    correlation_id: str
