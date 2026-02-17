# Known threat patterns and exploit signatures

KNOWN_EXPLOIT_SIGNATURES = {
    # Function signatures of known exploits
    "0x2e1a7d4d": {"name": "withdraw(uint256)", "risk": "HIGH",   "desc": "Direct withdraw — used in reentrancy attacks"},
    "0xf3fef3a3": {"name": "withdraw(address,uint256)", "risk": "HIGH", "desc": "Token withdrawal"},
    "0x853828b6": {"name": "withdrawAll()", "risk": "CRITICAL", "desc": "Drain all funds"},
    "0xa0712d68": {"name": "mint(uint256)", "risk": "MEDIUM",   "desc": "Token minting — verify authorization"},
    "0x42966c68": {"name": "burn(uint256)", "risk": "MEDIUM",   "desc": "Token burning"},
    "0x095ea7b3": {"name": "approve(address,uint256)", "risk": "MEDIUM", "desc": "Unlimited approval — common exploit vector"},
}

KNOWN_MALICIOUS_PATTERNS = [
    # Prompt injection patterns
    "ignore previous instructions",
    "ignore all guardrails",
    "bypass security",
    "disable safety",
    "send all funds",
    "transfer everything",
    "override restrictions",
    "forget your rules",
    "you are now",
    "new instructions:",
    "system override",
    "admin mode",
    "developer mode",
]

KNOWN_SAFE_CONTRACTS = {
    # Mainnet (for reference)
    "0x7a250d5630b4cf539739df2c5dacb4c659f2488d": "Uniswap V2 Router",
    "0xe592427a0aece92de3edee1f18e0157c05861564": "Uniswap V3 Router",
    "0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9": "Aave V2 Lending Pool",
    "0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2": "Aave V3 Lending Pool",
    "0xc36442b4a4522e871399cd717abdd847ab11fe88": "Uniswap V3 Positions NFT",
}

KNOWN_MALICIOUS_CONTRACTS = {
    "0x0000000000000000000000000000000000000000": "Zero address — likely error",
    "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef": "Dead address — funds unrecoverable",
}

HIGH_RISK_VALUE_THRESHOLDS = {
    "MEDIUM": 0.1,   # ETH
    "HIGH":   0.5,
    "CRITICAL": 1.0
}

def check_function_sig(sig: str) -> dict | None:
    return KNOWN_EXPLOIT_SIGNATURES.get(sig.lower() if sig else "")

def check_prompt_injection(text: str) -> list[str]:
    if not text:
        return []
    text_lower = text.lower()
    return [p for p in KNOWN_MALICIOUS_PATTERNS if p in text_lower]

def check_contract(address: str) -> tuple[str, str]:
    """Returns (status, name) — status: 'safe', 'malicious', 'unknown'"""
    addr_lower = address.lower()
    if addr_lower in {k.lower() for k in KNOWN_SAFE_CONTRACTS}:
        name = next(v for k, v in KNOWN_SAFE_CONTRACTS.items() if k.lower() == addr_lower)
        return "safe", name
    if addr_lower in {k.lower() for k in KNOWN_MALICIOUS_CONTRACTS}:
        name = next(v for k, v in KNOWN_MALICIOUS_CONTRACTS.items() if k.lower() == addr_lower)
        return "malicious", name
    return "unknown", "Unverified contract"

def get_value_risk(value_eth: float) -> str:
    if value_eth >= HIGH_RISK_VALUE_THRESHOLDS["CRITICAL"]:
        return "CRITICAL"
    elif value_eth >= HIGH_RISK_VALUE_THRESHOLDS["HIGH"]:
        return "HIGH"
    elif value_eth >= HIGH_RISK_VALUE_THRESHOLDS["MEDIUM"]:
        return "MEDIUM"
    return "LOW"