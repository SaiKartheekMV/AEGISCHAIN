import hashlib
import json
from datetime import datetime
from groq import Groq
from app.core.config import settings
from app.models.transaction import TransactionRequest, TransactionResponse, TxDecision, RiskLevel
from app.services.risk_scorer import risk_scorer

# Load contract ABIs
def load_abi(name: str):
    try:
        with open(f"../shared/contract_abis/{name}.json") as f:
            data = json.load(f)
            return data.get("abi", data)
    except:
        return []

class GuardRailEngine:

    def __init__(self):
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
        self.daily_spend_cache: dict[str, float] = {}  # Simple in-memory tracker
        self.blacklist: set[str] = set()
        self.whitelist: set[str] = set()

        # Known malicious addresses (demo)
        self.blacklist.update([
            "0x0000000000000000000000000000000000000000",
            "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        ])

        # Known safe protocols (demo)
        self.whitelist.update([
            "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",  # Uniswap V2 Router
            "0xe592427a0aece92de3edee1f18e0157c05861564",  # Uniswap V3 Router
        ])

    async def validate(self, tx: TransactionRequest) -> TransactionResponse:
        tx_id = self._generate_tx_id(tx)

        # Get agent trust score (mock - in prod, query blockchain)
        agent_trust_score = self._get_agent_trust_score(tx.agent_address)
        daily_spent = self.daily_spend_cache.get(tx.agent_address, 0.0)

        is_blacklisted = tx.target_address.lower() in {a.lower() for a in self.blacklist}
        is_whitelisted = tx.target_address.lower() in {a.lower() for a in self.whitelist}

        # --- CALCULATE RISK SCORE ---
        risk_score, risk_level, checks_passed, checks_failed = risk_scorer.calculate_risk(
            agent_address=tx.agent_address,
            target_address=tx.target_address,
            value_eth=tx.value_eth,
            function_sig=tx.function_sig,
            intent=tx.intent,
            agent_trust_score=agent_trust_score,
            is_whitelisted=is_whitelisted,
            is_blacklisted=is_blacklisted,
            daily_spent_eth=daily_spent,
            daily_limit_eth=settings.DAILY_LIMIT_ETH,
            protocol=tx.protocol
        )

        # --- MAKE DECISION ---
        block_reason = None
        if is_blacklisted:
            decision = TxDecision.BLOCKED
            block_reason = "Target address is blacklisted"
        elif risk_score >= settings.RISK_SCORE_BLOCK_THRESHOLD:
            decision = TxDecision.BLOCKED
            block_reason = f"Risk score {risk_score}/100 exceeds threshold. Issues: {'; '.join(checks_failed)}"
        elif risk_level == RiskLevel.HIGH and tx.value_eth >= settings.HIGH_VALUE_THRESHOLD_ETH:
            decision = TxDecision.PENDING
            block_reason = "High risk + high value requires manual approval"
        else:
            decision = TxDecision.APPROVED
            # Track daily spend
            self.daily_spend_cache[tx.agent_address] = daily_spent + tx.value_eth

        # --- GET AI EXPLANATION ---
        ai_explanation = await self._get_ai_explanation(tx, risk_score, risk_level, decision, checks_failed)

        return TransactionResponse(
            tx_id=tx_id,
            decision=decision,
            risk_level=risk_level,
            risk_score=risk_score,
            block_reason=block_reason,
            ai_explanation=ai_explanation,
            checks_passed=checks_passed,
            checks_failed=checks_failed,
            timestamp=datetime.utcnow().isoformat()
        )

    async def _get_ai_explanation(
        self,
        tx: TransactionRequest,
        risk_score: int,
        risk_level: RiskLevel,
        decision: TxDecision,
        issues: list[str]
    ) -> str:
        try:
            prompt = f"""You are AegisChain, an AI security guard for blockchain transactions.
Analyze this transaction and give a SHORT (2-3 sentence) plain English explanation.

Transaction Details:
- Agent: {tx.agent_address[:10]}...
- Target: {tx.target_address[:10]}...
- Value: {tx.value_eth} ETH
- Intent: {tx.intent or 'Not specified'}
- Protocol: {tx.protocol or 'Unknown'}
- Risk Score: {risk_score}/100
- Risk Level: {risk_level}
- Decision: {decision}
- Issues Found: {', '.join(issues) if issues else 'None'}

Respond in 2-3 sentences explaining WHY this decision was made in simple terms.
Be direct, technical but understandable. Start with the decision."""

            response = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=150,
                temperature=0.3
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"Transaction {decision.value} with risk score {risk_score}/100. {'; '.join(issues) if issues else 'All checks passed.'}"

    def _generate_tx_id(self, tx: TransactionRequest) -> str:
        data = f"{tx.agent_address}{tx.target_address}{tx.value_eth}{datetime.utcnow().isoformat()}"
        return "0x" + hashlib.sha256(data.encode()).hexdigest()[:40]

    def _get_agent_trust_score(self, address: str) -> int:
        # In production: query blockchain AgentRegistry contract
        # For demo: return 100 for known agents, 50 for unknown
        known_agents = {}
        return known_agents.get(address.lower(), 80)

    def add_to_blacklist(self, address: str):
        self.blacklist.add(address.lower())

    def add_to_whitelist(self, address: str):
        self.whitelist.add(address.lower())

guardrail_engine = GuardRailEngine()