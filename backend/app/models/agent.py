from pydantic import BaseModel, Field
from typing import Optional

class AgentCreate(BaseModel):
    address: str = Field(..., description="Agent wallet address")
    name: str = Field(..., description="Agent name")

class AgentResponse(BaseModel):
    address: str
    name: str
    trust_score: int
    is_active: bool
    tx_count: int
    blocked_count: int
    registered_at: str

class AgentUpdate(BaseModel):
    trust_score: Optional[int] = Field(None, ge=0, le=100)
    is_active: Optional[bool] = None