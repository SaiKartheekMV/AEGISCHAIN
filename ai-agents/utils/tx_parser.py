import re
from dataclasses import dataclass

@dataclass
class ParsedTransaction:
    agent_address: str
    target_address: str
    value_eth: float
    function_sig: str | None
    intent: str | None
    protocol: str | None
    raw_data: dict

def parse_transaction(data: dict) -> ParsedTransaction:
    """Normalize raw tx data into a clean ParsedTransaction object"""
    return ParsedTransaction(
        agent_address=data.get("agent_address", "0x0"),
        target_address=data.get("target_address", "0x0"),
        value_eth=float(data.get("value_eth", 0)),
        function_sig=data.get("function_sig"),
        intent=data.get("intent"),
        protocol=data.get("protocol"),
        raw_data=data
    )

def extract_addresses_from_text(text: str) -> list[str]:
    """Extract all Ethereum addresses from a string"""
    return re.findall(r'0x[a-fA-F0-9]{40}', text)

def extract_eth_amounts(text: str) -> list[float]:
    """Extract ETH amounts from text"""
    matches = re.findall(r'(\d+\.?\d*)\s*(?:eth|ETH|Eth)', text)
    return [float(m) for m in matches]

def detect_intent_mismatch(intent: str, target: str, value: float) -> list[str]:
    """Check if intent text contradicts the actual tx parameters"""
    mismatches = []

    # Address mismatch
    mentioned = extract_addresses_from_text(intent or "")
    if mentioned and not any(a.lower() == target.lower() for a in mentioned):
        mismatches.append(
            f"Intent mentions {mentioned[0][:10]}... but target is {target[:10]}..."
        )

    # Amount mismatch
    amounts = extract_eth_amounts(intent or "")
    if amounts and abs(amounts[0] - value) > 0.001:
        mismatches.append(
            f"Intent says {amounts[0]} ETH but tx value is {value} ETH"
        )

    return mismatches