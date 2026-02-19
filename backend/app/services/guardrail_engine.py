import hashlib
import json
import os
from datetime import datetime
from groq import Groq
from web3 import Web3
from sqlalchemy import select
from app.core.config import settings
from app.models.transaction import TransactionRequest, TransactionResponse, TxDecision, RiskLevel
from app.services.risk_scorer import risk_scorer
from app.db.schemas import AgentRecord

# Load contract ABIs
def load_abi(name: str):
    try:
        # Try absolute path first, then relative
        paths = [
            f"../../shared/contract_abis/{name}.json",
            f"../shared/contract_abis/{name}.json",
            f"shared/contract_abis/{name}.json",
            f"./shared/contract_abis/{name}.json"
        ]
        
        for path in paths:
            if os.path.exists(path):
                with open(path) as f:
                    data = json.load(f)
                    return data.get("abi", data)
        
        print(f"⚠️  Warning: Could not load ABI for {name}")
        return []
    except Exception as e:
        print(f"⚠️  Error loading ABI for {name}: {str(e)}")
        return []

class GuardRailEngine:

    def __init__(self):
        self.groq_client = Groq(api_key=settings.GROQ_API_KEY)
        self.daily_spend_cache: dict[str, float] = {}
        
        # Initialize Web3
        self.w3 = Web3(Web3.HTTPProvider(settings.SEPOLIA_RPC_URL))
        
        # Load contract instances
        self.guardrail_contract = None
        self.agent_registry_contract = None
        self.audit_trail_contract = None
        self.blacklist: set[str] = set()
        self.whitelist: set[str] = set()

        # Initialize contracts if addresses are set
        self._init_contracts()

        # Known malicious addresses (default blacklist)
        self.blacklist.update([
            "0x0000000000000000000000000000000000000000",
            "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
        ])

        # Known safe protocols (default whitelist)
        self.whitelist.update([
            "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",  # Uniswap V2 Router
            "0xe592427a0aece92de3edee1f18e0157c05861564",  # Uniswap V3 Router
        ])

    def _init_contracts(self):
        """Initialize contract instances"""
        try:
            if not self.w3.is_connected():
                print(f"⚠️  Warning: Cannot connect to {settings.SEPOLIA_RPC_URL}")
                return
            
            # Load ABIs
            guardrail_abi = load_abi("GuardRail")
            agent_registry_abi = load_abi("AgentRegistry")
            audit_trail_abi = load_abi("AuditTrail")
            
            # Initialize contracts
            if guardrail_abi and settings.GUARDRAIL_CONTRACT:
                self.guardrail_contract = self.w3.eth.contract(
                    address=Web3.to_checksum_address(settings.GUARDRAIL_CONTRACT),
                    abi=guardrail_abi
                )
            
            if agent_registry_abi and settings.AGENT_REGISTRY_CONTRACT:
                self.agent_registry_contract = self.w3.eth.contract(
                    address=Web3.to_checksum_address(settings.AGENT_REGISTRY_CONTRACT),
                    abi=agent_registry_abi
                )
            
            if audit_trail_abi and settings.AUDIT_TRAIL_CONTRACT:
                self.audit_trail_contract = self.w3.eth.contract(
                    address=Web3.to_checksum_address(settings.AUDIT_TRAIL_CONTRACT),
                    abi=audit_trail_abi
                )
            
            print("✅ Contracts initialized successfully")
        except Exception as e:
            print(f"⚠️  Error initializing contracts: {str(e)}")

    async def validate(self, tx: TransactionRequest, db=None) -> TransactionResponse:
        tx_id = self._generate_tx_id(tx)

        # Get agent trust score (from database or blockchain)
        agent_trust_score = await self._get_agent_trust_score(tx.agent_address, db)
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
            content = response.choices[0].message.content
            return content.strip() if content else ""
        except Exception as e:
            return f"Transaction {decision.value} with risk score {risk_score}/100. {'; '.join(issues) if issues else 'All checks passed.'}"

    def _generate_tx_id(self, tx: TransactionRequest) -> str:
        data = f"{tx.agent_address}{tx.target_address}{tx.value_eth}{datetime.utcnow().isoformat()}"
        return "0x" + hashlib.sha256(data.encode()).hexdigest()[:40]

    async def _get_agent_trust_score(self, address: str, db=None) -> int:
        """Get agent trust score from database first, then blockchain, then default"""
        try:
            # 1) Try to get from database
            if db:
                result = await db.execute(
                    select(AgentRecord).where(AgentRecord.address == address)
                )
                agent = result.scalar_one_or_none()
                if agent:
                    return int(agent.trust_score)
            
            # 2) Try to get from blockchain (AgentRegistry contract)
            if self.agent_registry_contract:
                agent_data = self.agent_registry_contract.functions.getAgent(
                    Web3.to_checksum_address(address)
                ).call()
                
                # agent_data is a tuple: (agentAddress, name, status, trustScore, registeredAt, txCount, blockedCount)
                if agent_data and agent_data[3]:
                    return int(agent_data[3])
            
            # 3) Fall back to default good trust score for new agents
            # Instead of 80, use 50 to be safer but not block new agents
            return 50
            
        except Exception as e:
            print(f"⚠️  Could not fetch agent trust score: {str(e)}")
            # Return 50 instead of 80 to allow new agents
            return 50

    def add_to_blacklist(self, address: str):
        """Add address to local blacklist"""
        self.blacklist.add(address.lower())
        try:
            if self.guardrail_contract and settings.DEPLOYER_PRIVATE_KEY:
                # In production, would call contract via transaction
                print(f"📋 Address {address} added to blacklist (local cache)")
        except Exception as e:
            print(f"⚠️  Error updating blockchain blacklist: {str(e)}")

    def add_to_whitelist(self, address: str):
        """Add address to local whitelist"""
        self.whitelist.add(address.lower())
        try:
            if self.guardrail_contract and settings.DEPLOYER_PRIVATE_KEY:
                # In production, would call contract via transaction
                print(f"📋 Address {address} added to whitelist (local cache)")
        except Exception as e:
            print(f"⚠️  Error updating blockchain whitelist: {str(e)}")

guardrail_engine = GuardRailEngine()