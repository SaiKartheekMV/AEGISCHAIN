import httpx
import os
from dotenv import load_dotenv
from dataclasses import dataclass

load_dotenv()

BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

@dataclass
class RuntimeResult:
    passed: bool
    decision: str          # APPROVED / BLOCKED / PENDING
    risk_level: str
    risk_score: int
    tx_id: str
    block_reason: str | None
    ai_explanation: str
    checks_passed: list[str]
    checks_failed: list[str]

class RuntimeGuard:
    """
    Layer 2: Sends tx to FastAPI backend for deep validation.
    Uses risk scorer + Groq AI analysis.
    """

    async def validate(
        self,
        agent_address: str,
        target_address: str,
        value_eth: float,
        function_sig: str | None = None,
        intent: str | None = None,
        protocol: str | None = None
    ) -> RuntimeResult:

        payload = {
            "agent_address": agent_address,
            "target_address": target_address,
            "value_eth": value_eth,
            "function_sig": function_sig,
            "intent": intent,
            "protocol": protocol
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    f"{BACKEND_URL}/api/v1/transactions/validate",
                    json=payload
                )
                data = response.json()

                return RuntimeResult(
                    passed=data["decision"] == "APPROVED",
                    decision=data["decision"],
                    risk_level=data["risk_level"],
                    risk_score=data["risk_score"],
                    tx_id=data["tx_id"],
                    block_reason=data.get("block_reason"),
                    ai_explanation=data["ai_explanation"],
                    checks_passed=data.get("checks_passed", []),
                    checks_failed=data.get("checks_failed", [])
                )

        except httpx.ConnectError:
            # Backend offline — fail safe (block the tx)
            return RuntimeResult(
                passed=False,
                decision="BLOCKED",
                risk_level="CRITICAL",
                risk_score=100,
                tx_id="0x000",
                block_reason="GuardRail backend unreachable — failing safe",
                ai_explanation="Transaction blocked: security backend is offline. Cannot validate safely.",
                checks_passed=[],
                checks_failed=["GuardRail backend offline"]
            )

runtime_guard = RuntimeGuard()