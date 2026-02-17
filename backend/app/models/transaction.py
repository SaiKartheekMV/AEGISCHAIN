from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class TxDecision(str, Enum):
    APPROVED = "APPROVED"
    BLOCKED = "BLOCKED"
    PENDING = "PENDING"

class TransactionRequest(BaseModel):
    agent_address: str = Field(..., description="AI agent wallet address")
    target_address: str = Field(..., description="Target contract or wallet")
    value_eth: float = Field(..., ge=0, description="Value in ETH")
    function_sig: Optional[str] = Field(None, description="Function signature e.g. 0xa9059cbb")
    intent: Optional[str] = Field(None, description="What the agent thinks it's doing")
    protocol: Optional[str] = Field(None, description="DeFi protocol name e.g. Uniswap")

    class Config:
        json_schema_extra = {
            "example": {
                "agent_address": "0xAgentAddress",
                "target_address": "0xTargetAddress",
                "value_eth": 0.1,
                "function_sig": "0xa9059cbb",
                "intent": "Swap 0.1 ETH for USDC on Uniswap",
                "protocol": "Uniswap"
            }
        }

class TransactionResponse(BaseModel):
    tx_id: str
    decision: TxDecision
    risk_level: RiskLevel
    risk_score: int
    block_reason: Optional[str] = None
    ai_explanation: str
    checks_passed: list[str]
    checks_failed: list[str]
    timestamp: str