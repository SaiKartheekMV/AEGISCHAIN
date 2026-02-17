from utils.threat_db import (
    check_function_sig, check_prompt_injection,
    check_contract, get_value_risk
)
from utils.tx_parser import detect_intent_mismatch
from dataclasses import dataclass

@dataclass
class PreTxResult:
    passed: bool
    risk_level: str
    flags: list[str]
    warnings: list[str]
    recommendation: str

class PreTxGuard:
    """
    Layer 1: Runs BEFORE transaction is sent to backend.
    Fast, local checks — no API calls needed.
    """

    def check(
        self,
        agent_address: str,
        target_address: str,
        value_eth: float,
        function_sig: str | None,
        intent: str | None,
        protocol: str | None
    ) -> PreTxResult:

        flags   = []
        warnings = []

        # ── CHECK 1: Prompt injection in intent ──────────────────
        if intent:
            injections = check_prompt_injection(intent)
            if injections:
                flags.append(f"🚨 PROMPT INJECTION detected: '{injections[0]}'")

        # ── CHECK 2: Contract safety ─────────────────────────────
        status, contract_name = check_contract(target_address)
        if status == "malicious":
            flags.append(f"🚨 Target is KNOWN MALICIOUS: {contract_name}")
        elif status == "unknown":
            warnings.append(f"⚠️  Target contract unverified: {target_address[:12]}...")
        else:
            warnings.append(f"✅ Target is known safe contract: {contract_name}")

        # ── CHECK 3: Function signature ──────────────────────────
        if function_sig:
            sig_info = check_function_sig(function_sig)
            if sig_info:
                if sig_info["risk"] in ("HIGH", "CRITICAL"):
                    flags.append(f"🚨 Dangerous function: {sig_info['name']} — {sig_info['desc']}")
                else:
                    warnings.append(f"⚠️  Risky function: {sig_info['name']} — {sig_info['desc']}")

        # ── CHECK 4: Value risk ──────────────────────────────────
        value_risk = get_value_risk(value_eth)
        if value_risk == "CRITICAL":
            flags.append(f"🚨 CRITICAL value: {value_eth} ETH (≥1 ETH threshold)")
        elif value_risk == "HIGH":
            warnings.append(f"⚠️  High value: {value_eth} ETH — requires extra care")
        elif value_risk == "MEDIUM":
            warnings.append(f"⚠️  Medium value: {value_eth} ETH")

        # ── CHECK 5: Intent vs tx mismatch (hallucination) ───────
        mismatches = detect_intent_mismatch(intent or "", target_address, value_eth)
        for m in mismatches:
            flags.append(f"🚨 HALLUCINATION DETECTED: {m}")

        # ── CHECK 6: Zero address ────────────────────────────────
        if target_address == "0x0000000000000000000000000000000000000000":
            flags.append("🚨 Target is ZERO ADDRESS — transaction would burn funds")

        # ── DETERMINE OUTCOME ────────────────────────────────────
        if flags:
            risk   = "CRITICAL" if any("CRITICAL" in f or "INJECTION" in f or "MALICIOUS" in f or "HALLUCINATION" in f for f in flags) else "HIGH"
            passed = False
            recommendation = "ABORT — critical issues found"
        elif len(warnings) >= 3:
            risk   = "MEDIUM"
            passed = True
            recommendation = "PROCEED WITH CAUTION — multiple warnings"
        else:
            risk   = "LOW"
            passed = True
            recommendation = "PROCEED — pre-checks passed"

        return PreTxResult(
            passed=passed,
            risk_level=risk,
            flags=flags,
            warnings=warnings,
            recommendation=recommendation
        )

pre_tx_guard = PreTxGuard()