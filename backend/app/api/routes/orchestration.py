from fastapi import APIRouter, Request

from app.api.errors import AppError
from app.api.schemas.orchestration import (
    AgentRunResponse,
    EvidenceResponse,
    OrchestrationResponse,
    PolicyVersionResponse,
    ProposalResponse,
    StartAgentRunRequest,
)
from app.models.deterministic import DeterministicModelGateway
from app.models.gateway import ModelGateway
from app.persistence.database import Database
from app.retrieval.retriever import PolicyRetriever
from app.services.orchestration_service import OrchestrationService

router = APIRouter(prefix="/api", tags=["agent-runs"])


def _service(request: Request) -> OrchestrationService:
    database: Database | None = request.app.state.database
    if database is None:
        raise AppError(
            code="database_not_configured",
            message="Agent orchestration is not available.",
            status_code=503,
        )
    model_gateway: ModelGateway = getattr(
        request.app.state, "model_gateway", DeterministicModelGateway()
    )
    return OrchestrationService(database, model_gateway)


@router.post(
    "/tasks/{task_id}/agent-runs",
    response_model=OrchestrationResponse,
    status_code=201,
)
def start_agent_run(
    task_id: str,
    command: StartAgentRunRequest,
    request: Request,
) -> OrchestrationResponse:
    try:
        result = _service(request).start_or_resume(
            task_public_id=task_id,
            correlation_id=str(request.state.correlation_id),
            run_public_id=command.run_id,
        )
    except LookupError as exc:
        raise AppError(code="orchestration_not_found", message=str(exc), status_code=404) from exc
    return OrchestrationResponse(run=result.run, proposal=result.proposal)


@router.get("/agent-runs/{run_id}", response_model=AgentRunResponse)
def get_agent_run(run_id: str, request: Request) -> AgentRunResponse:
    run = _service(request).get_run(run_id)
    if run is None:
        raise AppError(
            code="agent_run_not_found",
            message=f"Agent run {run_id} was not found.",
            status_code=404,
        )
    return AgentRunResponse(data=run)


@router.get(
    "/tasks/{task_id}/proposals/{version}",
    response_model=ProposalResponse,
)
def get_proposal(task_id: str, version: int, request: Request) -> ProposalResponse:
    proposal = _service(request).get_proposal(task_public_id=task_id, version=version)
    if proposal is None:
        raise AppError(
            code="proposal_not_found",
            message=f"Proposal {task_id} version {version} was not found.",
            status_code=404,
        )
    return ProposalResponse(data=proposal)


@router.get("/agent-runs/{run_id}/evidence", response_model=EvidenceResponse)
def get_evidence(run_id: str, request: Request) -> EvidenceResponse:
    service = _service(request)
    run = service.get_run(run_id)
    if run is None:
        raise AppError(
            code="agent_run_not_found",
            message=f"Agent run {run_id} was not found.",
            status_code=404,
        )
    proposal = service.get_proposal_for_run(run.id)
    if proposal is None:
        return EvidenceResponse(items=[])
    return EvidenceResponse(items=PolicyRetriever(service.database).list_for_proposal(proposal.id))


@router.get(
    "/policies/{policy_id}/versions/{version}",
    response_model=PolicyVersionResponse,
)
def get_policy_version(policy_id: str, version: int, request: Request) -> PolicyVersionResponse:
    service = _service(request)
    policy = PolicyRetriever(service.database).get_policy(policy_id, version)
    if policy is None:
        raise AppError(
            code="policy_version_not_found",
            message=f"Policy {policy_id} version {version} was not found.",
            status_code=404,
        )
    return PolicyVersionResponse(data=policy)
