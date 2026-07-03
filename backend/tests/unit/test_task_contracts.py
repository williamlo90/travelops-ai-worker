from datetime import UTC, datetime, timedelta, timezone

import pytest
from pydantic import ValidationError

from app.domain.tasks import RequestChannel, TaskCreate


def test_task_requires_utc_received_timestamp() -> None:
    with pytest.raises(ValidationError):
        TaskCreate(
            public_id="RF-1042",
            customer_message="Refund requested.",
            channel=RequestChannel.EMAIL,
            received_at=datetime(2026, 7, 3, tzinfo=timezone(timedelta(hours=7))),
            correlation_id="corr_test",
        )


def test_task_accepts_utc_received_timestamp() -> None:
    command = TaskCreate(
        public_id="RF-1042",
        customer_message="Refund requested.",
        channel=RequestChannel.EMAIL,
        received_at=datetime(2026, 7, 3, tzinfo=UTC),
        correlation_id="corr_test",
    )

    assert command.received_at.utcoffset() == timedelta(0)
