from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.models.transaction import TransactionRequest, TransactionResponse
from app.services.guardrail_engine import guardrail_engine
from app.services.audit_logger import audit_logger

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/validate", response_model=TransactionResponse)
async def validate_transaction(
    tx: TransactionRequest,
    db: AsyncSession = Depends(get_db)
):
    """🔥 Core endpoint — validate a transaction through all guardrail layers"""
    result = await guardrail_engine.validate(tx)
    await audit_logger.log_transaction(db, tx, result)
    return result

@router.get("/history")
async def get_transaction_history(
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Get recent transaction history"""
    txs = await audit_logger.get_recent_transactions(db, limit)
    return [
        {
            "tx_id": t.tx_id,
            "agent_address": t.agent_address,
            "target_address": t.target_address,
            "value_eth": t.value_eth,
            "risk_level": t.risk_level,
            "risk_score": t.risk_score,
            "decision": t.decision,
            "block_reason": t.block_reason,
            "ai_explanation": t.ai_explanation,
            "timestamp": str(t.timestamp)
        } for t in txs
    ]

@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Dashboard stats — total, approved, blocked, pending"""
    return await audit_logger.get_stats(db)

@router.post("/blacklist/{address}")
async def blacklist_address(address: str, db: AsyncSession = Depends(get_db)):
    """Add address to blacklist"""
    guardrail_engine.add_to_blacklist(address)
    await audit_logger.log_event(db, "BLACKLIST_ADDED", address, f"Address {address} blacklisted", 100)
    return {"message": f"Address {address} blacklisted successfully"}

@router.post("/whitelist/{address}")
async def whitelist_address(address: str, db: AsyncSession = Depends(get_db)):
    """Add address to whitelist"""
    guardrail_engine.add_to_whitelist(address)
    await audit_logger.log_event(db, "WHITELIST_ADDED", address, f"Address {address} whitelisted", 0)
    return {"message": f"Address {address} whitelisted successfully"}