from llm.groq_client import groq_client
from llm.prompt_templates import POST_TX_ANALYSIS_PROMPT
from dataclasses import dataclass
import json, re

@dataclass
class PostTxResult:
    outcome_matches_intent: bool
    anomalies: list[str]
    trust_score_adjustment: int
    lesson_learned: str
    new_trust_score: int

class PostTxGuard:
    """
    Layer 3: Runs AFTER transaction decision is made.
    Learns from outcome, adjusts trust score, logs lessons.
    """

    def analyze(
        self,
        intent: str | None,
        target_address: str,
        value_eth: float,
        decision: str,
        ai_explanation: str,
        current_trust_score: int = 100
    ) -> PostTxResult:

        prompt = POST_TX_ANALYSIS_PROMPT.format(
            intent=intent or "No intent specified",
            target_address=target_address,
            value_eth=value_eth,
            decision=decision,
            ai_explanation=ai_explanation
        )

        result_text = groq_client.chat(
            system_prompt="You are a blockchain transaction outcome analyzer. Always respond in valid JSON only.",
            user_message=prompt,
            max_tokens=300
        )

        try:
            clean  = re.sub(r'```json|```', '', result_text).strip()
            data   = json.loads(clean)
        except:
            data = {
                "outcome_matches_intent": decision == "APPROVED",
                "anomalies": [],
                "trust_score_adjustment": 0,
                "lesson_learned": "Could not analyze outcome"
            }

        adjustment      = int(data.get("trust_score_adjustment", 0))
        adjustment      = max(-20, min(5, adjustment))   # Clamp -20 to +5
        new_trust_score = max(0, min(100, current_trust_score + adjustment))

        return PostTxResult(
            outcome_matches_intent=data.get("outcome_matches_intent", True),
            anomalies=data.get("anomalies", []),
            trust_score_adjustment=adjustment,
            lesson_learned=data.get("lesson_learned", ""),
            new_trust_score=new_trust_score
        )

post_tx_guard = PostTxGuard()