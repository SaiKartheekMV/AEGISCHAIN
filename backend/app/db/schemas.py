from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, Enum
from sqlalchemy.sql import func
from app.db.database import Base
import enum

class RiskLevelDB(enum.Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class DecisionDB(enum.Enum):
    APPROVED = "APPROVED"
    BLOCKED = "BLOCKED"
    PENDING = "PENDING"

class TransactionRecord(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    tx_id = Column(String, unique=True, index=True)
    agent_address = Column(String, index=True)
    target_address = Column(String)
    value_eth = Column(Float)
    function_sig = Column(String, nullable=True)
    risk_level = Column(String)
    risk_score = Column(Integer)
    decision = Column(String)
    block_reason = Column(Text, nullable=True)
    ai_explanation = Column(Text, nullable=True)
    tx_hash = Column(String, nullable=True)
    timestamp = Column(DateTime, server_default=func.now())

class AgentRecord(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True)
    address = Column(String, unique=True, index=True)
    name = Column(String)
    trust_score = Column(Integer, default=100)
    is_active = Column(Boolean, default=True)
    tx_count = Column(Integer, default=0)
    blocked_count = Column(Integer, default=0)
    registered_at = Column(DateTime, server_default=func.now())

class AuditRecord(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True)
    event_type = Column(String)
    agent_address = Column(String, index=True)
    target_address = Column(String, nullable=True)
    value_eth = Column(Float, nullable=True)
    description = Column(Text)
    risk_score = Column(Integer)
    timestamp = Column(DateTime, server_default=func.now())