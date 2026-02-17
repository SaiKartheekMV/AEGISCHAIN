from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

class GroqClient:

    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.3-70b-versatile"

    def chat(self, system_prompt: str, user_message: str, max_tokens: int = 500) -> str:
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user",   "content": user_message}
                ],
                max_tokens=max_tokens,
                temperature=0.2
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            return f"[Groq Error]: {str(e)}"

    def analyze_transaction(self, tx_data: dict) -> dict:
        """Ask LLM to reason about a transaction before sending"""
        system = """You are an AI transaction safety analyzer for blockchain operations.
Your job is to analyze what an AI agent intends to do and flag any risks.
Always respond in valid JSON only. No extra text."""

        user = f"""Analyze this transaction intent and respond ONLY in JSON:
{{
  "agent_address": "{tx_data.get('agent_address', '')}",
  "target_address": "{tx_data.get('target_address', '')}",
  "value_eth": {tx_data.get('value_eth', 0)},
  "intent": "{tx_data.get('intent', '')}",
  "protocol": "{tx_data.get('protocol', 'unknown')}"
}}

Respond ONLY with this JSON structure:
{{
  "is_safe": true/false,
  "confidence": 0-100,
  "risk_flags": ["list of issues"],
  "recommendation": "PROCEED / REVIEW / ABORT",
  "reasoning": "one sentence explanation"
}}"""

        result = self.chat(system, user, max_tokens=300)

        # Parse JSON safely
        import json, re
        try:
            clean = re.sub(r'```json|```', '', result).strip()
            return json.loads(clean)
        except:
            return {
                "is_safe": False,
                "confidence": 0,
                "risk_flags": ["LLM parse error"],
                "recommendation": "REVIEW",
                "reasoning": result[:200]
            }

groq_client = GroqClient()