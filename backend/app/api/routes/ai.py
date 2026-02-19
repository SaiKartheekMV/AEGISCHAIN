from fastapi import APIRouter
from pydantic import BaseModel, Field
import re
import secrets

router = APIRouter(prefix="/ai", tags=["AI"])


class ParseIntentRequest(BaseModel):
    intent: str = Field(..., min_length=1, description="Natural language transaction intent")


class ParseIntentResponse(BaseModel):
    to_address: str
    amount: float
    ai_confidence: int
    reasoning: str
    parsed_from: str
    transaction_type: str
    is_protocol_interaction: bool
    protocol_name: str | None = None


ADDRESS_RE = re.compile(r"0x[a-fA-F0-9]{40}")
AMOUNT_RE = re.compile(r"\b(\d+\.?\d*)\s*eth\b", re.IGNORECASE)


def _random_eth_address() -> str:
    # Generate a realistic 20-byte Ethereum-like hex address.
    return "0x" + secrets.token_hex(20)


@router.post("/parse-intent", response_model=ParseIntentResponse)
async def parse_intent(payload: ParseIntentRequest):
    text = payload.intent.strip()
    intent_lower = text.lower()

    address_match = ADDRESS_RE.search(text)
    amount_match = AMOUNT_RE.search(text)

    hallucinated_address = False
    if address_match:
        to_address = address_match.group(0)
    else:
        to_address = _random_eth_address()
        hallucinated_address = True
    amount = float(amount_match.group(1)) if amount_match else 0.0

    protocol_name = None
    is_protocol_interaction = False
    if "uniswap" in intent_lower:
        protocol_name = "Uniswap"
        is_protocol_interaction = True
    elif "aave" in intent_lower:
        protocol_name = "Aave"
        is_protocol_interaction = True

    confidence = 95
    reasons: list[str] = []
    if hallucinated_address:
        confidence -= 35
        reasons.append("No explicit 0x address found; generated a plausible destination address")
    if not amount_match:
        confidence -= 30
        reasons.append("No explicit ETH amount found")
    if not reasons:
        reasons.append("Detected address and ETH amount from intent")

    confidence = max(0, min(100, confidence))

    return ParseIntentResponse(
        to_address=to_address,
        amount=amount,
        ai_confidence=confidence,
        reasoning="; ".join(reasons),
        parsed_from="ai_input",
        transaction_type="protocol_interaction" if is_protocol_interaction else "wallet_transfer",
        is_protocol_interaction=is_protocol_interaction,
        protocol_name=protocol_name,
    )
