from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # App
    APP_NAME: str = "AegisChain GuardRail API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "aegischain_secret_key_2024"

    # Groq
    GROQ_API_KEY: str = ""

    # Blockchain
    SEPOLIA_RPC_URL: str = ""
    DEPLOYER_PRIVATE_KEY: str = ""
    GUARDRAIL_CONTRACT: str = ""
    AGENT_REGISTRY_CONTRACT: str = ""
    AUDIT_TRAIL_CONTRACT: str = ""

    # Risk Thresholds
    MAX_TX_VALUE_ETH: float = 1.0
    DAILY_LIMIT_ETH: float = 5.0
    HIGH_VALUE_THRESHOLD_ETH: float = 0.5
    RISK_SCORE_BLOCK_THRESHOLD: int = 75  # Block if score >= 75

    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()