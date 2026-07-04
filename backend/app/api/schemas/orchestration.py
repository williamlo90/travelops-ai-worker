from pydantic import BaseModel, Field

from app.domain.proposals import ProposalVersionRecord
from app.domain.runs import AgentRunRecord


class StartAgentRunRequest(BaseModel):
    run_id: str | None = Field(default=None, pattern=r"^AR-[A-Z0-9]{4,12}$")


class AgentRunResponse(BaseModel):
    data: AgentRunRecord


class ProposalResponse(BaseModel):
    data: ProposalVersionRecord


class OrchestrationResponse(BaseModel):
    run: AgentRunRecord
    proposal: ProposalVersionRecord
