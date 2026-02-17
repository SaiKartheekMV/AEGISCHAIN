from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.db.schemas import AgentRecord
from app.models.agent import AgentCreate, AgentResponse, AgentUpdate
from app.services.audit_logger import audit_logger
from datetime import datetime

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.post("/register", response_model=AgentResponse)
async def register_agent(agent: AgentCreate, db: AsyncSession = Depends(get_db)):
    """Register a new AI agent"""
    existing = await db.execute(select(AgentRecord).where(AgentRecord.address == agent.address))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Agent already registered")

    new_agent = AgentRecord(address=agent.address, name=agent.name)
    db.add(new_agent)
    await db.commit()
    await db.refresh(new_agent)

    await audit_logger.log_event(db, "AGENT_REGISTERED", agent.address, f"Agent '{agent.name}' registered")

    return AgentResponse(
        address=new_agent.address,
        name=new_agent.name,
        trust_score=new_agent.trust_score,
        is_active=new_agent.is_active,
        tx_count=new_agent.tx_count,
        blocked_count=new_agent.blocked_count,
        registered_at=str(new_agent.registered_at)
    )

@router.get("/", response_model=list[AgentResponse])
async def get_all_agents(db: AsyncSession = Depends(get_db)):
    """Get all registered agents"""
    result = await db.execute(select(AgentRecord))
    agents = result.scalars().all()
    return [
        AgentResponse(
            address=a.address, name=a.name,
            trust_score=a.trust_score, is_active=a.is_active,
            tx_count=a.tx_count, blocked_count=a.blocked_count,
            registered_at=str(a.registered_at)
        ) for a in agents
    ]

@router.get("/{address}", response_model=AgentResponse)
async def get_agent(address: str, db: AsyncSession = Depends(get_db)):
    """Get a specific agent by address"""
    result = await db.execute(select(AgentRecord).where(AgentRecord.address == address))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return AgentResponse(
        address=agent.address, name=agent.name,
        trust_score=agent.trust_score, is_active=agent.is_active,
        tx_count=agent.tx_count, blocked_count=agent.blocked_count,
        registered_at=str(agent.registered_at)
    )

@router.patch("/{address}")
async def update_agent(address: str, update: AgentUpdate, db: AsyncSession = Depends(get_db)):
    """Update agent trust score or status"""
    result = await db.execute(select(AgentRecord).where(AgentRecord.address == address))
    agent = result.scalar_one_or_none()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    if update.trust_score is not None:
        agent.trust_score = update.trust_score
    if update.is_active is not None:
        agent.is_active = update.is_active

    await db.commit()
    return {"message": "Agent updated", "address": address}