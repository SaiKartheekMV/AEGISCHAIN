from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.db.schemas import TransactionRecord, AgentRecord, AuditRecord
from app.models.transaction import TransactionResponse, TransactionRequest
from datetime import datetime

class AuditLogger:

    async def log_transaction(
        self,
        db: AsyncSession,
        tx_request: TransactionRequest,
        tx_response: TransactionResponse
    ):
        record = TransactionRecord(
            tx_id=tx_response.tx_id,
            agent_address=tx_request.agent_address,
            target_address=tx_request.target_address,
            value_eth=tx_request.value_eth,
            function_sig=tx_request.function_sig,
            risk_level=tx_response.risk_level.value,
            risk_score=tx_response.risk_score,
            decision=tx_response.decision.value,
            block_reason=tx_response.block_reason,
            ai_explanation=tx_response.ai_explanation
        )
        db.add(record)
        await db.commit()

    async def log_event(
        self,
        db: AsyncSession,
        event_type: str,
        agent_address: str,
        description: str,
        risk_score: int = 0,
        target_address: str = None,
        value_eth: float = None
    ):
        record = AuditRecord(
            event_type=event_type,
            agent_address=agent_address,
            target_address=target_address,
            value_eth=value_eth,
            description=description,
            risk_score=risk_score
        )
        db.add(record)
        await db.commit()

    async def get_recent_transactions(self, db: AsyncSession, limit: int = 50):
        result = await db.execute(
            select(TransactionRecord)
            .order_by(desc(TransactionRecord.timestamp))
            .limit(limit)
        )
        return result.scalars().all()

    async def get_audit_logs(self, db: AsyncSession, limit: int = 100):
        result = await db.execute(
            select(AuditRecord)
            .order_by(desc(AuditRecord.timestamp))
            .limit(limit)
        )
        return result.scalars().all()

    async def get_stats(self, db: AsyncSession):
        from sqlalchemy import func
        total = await db.execute(select(func.count(TransactionRecord.id)))
        approved = await db.execute(
            select(func.count(TransactionRecord.id))
            .where(TransactionRecord.decision == "APPROVED")
        )
        blocked = await db.execute(
            select(func.count(TransactionRecord.id))
            .where(TransactionRecord.decision == "BLOCKED")
        )
        pending = await db.execute(
            select(func.count(TransactionRecord.id))
            .where(TransactionRecord.decision == "PENDING")
        )
        return {
            "total": total.scalar(),
            "approved": approved.scalar(),
            "blocked": blocked.scalar(),
            "pending": pending.scalar()
        }

audit_logger = AuditLogger()