from app.models.transaction import RiskLevel

# Known malicious patterns
SUSPICIOUS_FUNCTION_SIGS = {
    "0x2e1a7d4d": "withdraw_all",
    "0x853828b6": "withdrawAll",
    "0xf3fef3a3": "withdraw",
}

KNOWN_SAFE_PROTOCOLS = [
    "uniswap", "aave", "compound", "curve", "lido",
    "maker", "balancer", "1inch"
]

class RiskScorer:

    def calculate_risk(
        self,
        agent_address: str,
        target_address: str,
        value_eth: float,
        function_sig: str | None,
        intent: str | None,
        agent_trust_score: int,
        is_whitelisted: bool,
        is_blacklisted: bool,
        daily_spent_eth: float,
        daily_limit_eth: float,
        protocol: str | None = None
    ) -> tuple[int, RiskLevel, list[str], list[str]]:
        """
        Returns: (score 0-100, risk_level, checks_passed, checks_failed)
        Higher score = more risky
        """
        score = 0
        checks_passed = []
        checks_failed = []

        # --- CRITICAL FLAGS (instant high score) ---
        if is_blacklisted:
            return 100, RiskLevel.CRITICAL, [], ["Target address is BLACKLISTED"]

        if agent_trust_score < 20:
            return 95, RiskLevel.CRITICAL, [], ["Agent trust score critically low"]

        # --- VALUE CHECKS ---
        if value_eth == 0:
            checks_passed.append("Zero value transaction (safe)")
        elif value_eth > 1.0:
            score += 40
            checks_failed.append(f"High value: {value_eth} ETH exceeds 1 ETH limit")
        elif value_eth > 0.5:
            score += 20
            checks_failed.append(f"Medium-high value: {value_eth} ETH")
        else:
            checks_passed.append(f"Value {value_eth} ETH within safe range")

        # --- DAILY LIMIT CHECK ---
        daily_usage_pct = (daily_spent_eth / daily_limit_eth) * 100 if daily_limit_eth > 0 else 0
        if daily_usage_pct > 90:
            score += 30
            checks_failed.append(f"Daily limit nearly exhausted ({daily_usage_pct:.0f}% used)")
        elif daily_usage_pct > 70:
            score += 15
            checks_failed.append(f"Daily limit {daily_usage_pct:.0f}% used")
        else:
            checks_passed.append(f"Daily limit usage OK ({daily_usage_pct:.0f}%)")

        # --- FUNCTION SIGNATURE CHECK ---
        if function_sig:
            if function_sig.lower() in SUSPICIOUS_FUNCTION_SIGS:
                score += 25
                checks_failed.append(f"Suspicious function: {SUSPICIOUS_FUNCTION_SIGS[function_sig.lower()]}")
            else:
                checks_passed.append("Function signature not flagged")
        else:
            checks_passed.append("Simple ETH transfer (no contract call)")

        # --- WHITELIST CHECK ---
        if is_whitelisted:
            score -= 10  # Reduce risk for trusted contracts
            score = max(0, score)
            checks_passed.append("Target address is whitelisted")
        else:
            score += 10
            checks_failed.append("Target address not in whitelist")

        # --- PROTOCOL CHECK ---
        if protocol:
            if protocol.lower() in KNOWN_SAFE_PROTOCOLS:
                score -= 5
                score = max(0, score)
                checks_passed.append(f"Protocol '{protocol}' is well-known and audited")
            else:
                score += 10
                checks_failed.append(f"Protocol '{protocol}' is unknown or unaudited")

        # --- AGENT TRUST SCORE ---
        if agent_trust_score >= 80:
            checks_passed.append(f"Agent trust score high ({agent_trust_score}/100)")
        elif agent_trust_score >= 50:
            score += 10
            checks_failed.append(f"Agent trust score moderate ({agent_trust_score}/100)")
        else:
            score += 20
            checks_failed.append(f"Agent trust score low ({agent_trust_score}/100)")

        # --- INTENT HALLUCINATION CHECK ---
        if intent:
            hallucination_flags = self._check_hallucination_patterns(intent, target_address, value_eth)
            if hallucination_flags:
                score += 20
                checks_failed.extend(hallucination_flags)
            else:
                checks_passed.append("Intent appears consistent with transaction")

        # --- DETERMINE RISK LEVEL ---
        score = min(100, max(0, score))
        if score >= 75:
            risk = RiskLevel.CRITICAL
        elif score >= 50:
            risk = RiskLevel.HIGH
        elif score >= 25:
            risk = RiskLevel.MEDIUM
        else:
            risk = RiskLevel.LOW

        return score, risk, checks_passed, checks_failed

    def _check_hallucination_patterns(
        self, intent: str, target: str, value: float
    ) -> list[str]:
        flags = []
        intent_lower = intent.lower()

        # Check if intent mentions 0x address that doesn't match target
        import re
        mentioned_addresses = re.findall(r'0x[a-fA-F0-9]{40}', intent)
        if mentioned_addresses:
            for addr in mentioned_addresses:
                if addr.lower() != target.lower():
                    flags.append(f"Intent mentions address {addr[:10]}... but target is different")

        # Check for amount mismatch
        mentioned_amounts = re.findall(r'\b(\d+\.?\d*)\s*eth\b', intent_lower)
        if mentioned_amounts:
            intent_value = float(mentioned_amounts[0])
            if abs(intent_value - value) > 0.01:
                flags.append(f"Intent says {intent_value} ETH but tx value is {value} ETH")

        return flags

risk_scorer = RiskScorer()