from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.audit_logger import audit_logger

router = APIRouter(prefix="/audit", tags=["Audit"])

@router.get("/logs")
async def get_audit_logs(limit: int = 100, db: AsyncSession = Depends(get_db)):
    """Get all audit logs"""
    logs = await audit_logger.get_audit_logs(db, limit)
    return [
        {
            "id": l.id,
            "event_type": l.event_type,
            "agent_address": l.agent_address,
            "target_address": l.target_address,
            "value_eth": l.value_eth,
            "description": l.description,
            "risk_score": l.risk_score,
            "timestamp": str(l.timestamp)
        } for l in logs
    ]