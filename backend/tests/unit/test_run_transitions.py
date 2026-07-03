import pytest

from app.domain.runs import InvalidRunTransition, RunStatus, validate_run_transition


@pytest.mark.parametrize(
    ("current", "target"),
    [
        (RunStatus.QUEUED, RunStatus.RUNNING),
        (RunStatus.RUNNING, RunStatus.WAITING_APPROVAL),
        (RunStatus.WAITING_APPROVAL, RunStatus.QUEUED),
        (RunStatus.FAILED_NO_SIDE_EFFECT, RunStatus.QUEUED),
        (RunStatus.EXECUTION_UNCERTAIN, RunStatus.RECONCILING),
        (RunStatus.RECONCILING, RunStatus.COMPLETED_VERIFIED),
    ],
)
def test_allows_explicit_run_transition(current: RunStatus, target: RunStatus) -> None:
    validate_run_transition(current, target)


@pytest.mark.parametrize(
    ("current", "target"),
    [
        (RunStatus.QUEUED, RunStatus.COMPLETED_VERIFIED),
        (RunStatus.EXECUTION_UNCERTAIN, RunStatus.QUEUED),
        (RunStatus.COMPLETED_VERIFIED, RunStatus.RUNNING),
        (RunStatus.ESCALATED, RunStatus.QUEUED),
    ],
)
def test_rejects_unsafe_run_transition(current: RunStatus, target: RunStatus) -> None:
    with pytest.raises(InvalidRunTransition):
        validate_run_transition(current, target)
