from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db.database import init_db
from app.api.routes import transactions, agents, audit, ai
from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print("🛡️  AegisChain GuardRail API started")
    yield
    print("🛑 AegisChain API shutting down")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="AI Agent Transaction Guardrails for Autonomous On-Chain Agents",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routes
app.include_router(transactions.router, prefix="/api/v1")
app.include_router(agents.router, prefix="/api/v1")
app.include_router(audit.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "name": "AegisChain GuardRail API",
        "version": "1.0.0",
        "status": "🟢 operational",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}
