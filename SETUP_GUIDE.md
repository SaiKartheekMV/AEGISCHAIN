# 🛡️ AegisChain GuardRail System - Complete Setup Guide

## Project Overview

**AegisChain** is a production-ready **AI-native guardrail system** for securing autonomous on-chain agents. It provides three-layer protection against:
- ✅ Prompt injection attacks
- ✅ Hallucinated transactions
- ✅ Malicious contract interactions
- ✅ Value limit violations
- ✅ Unauthorized fund transfers

---

## 📋 Prerequisites

### Required Software
- **Node.js** 18+ (for blockchain and frontend)
- **Python** 3.10+ (for backend and AI agents)
- **Hardhat** (Ethereum development environment)
- **MetaMask** browser extension
- **Git**

### Required Accounts & Keys
1. **Groq API Key** (free LLM access)
   - Sign up: https://console.groq.com
   - Get API key from dashboard

2. **Infura or Alchemy RPC Key** (for Sepolia testnet)
   - Sign up: https://infura.io or https://www.alchemy.com
   - Create a new Sepolia project to get RPC URL

3. **Sepolia Testnet ETH**
   - Get from faucet: https://sepolia-faucet.pk910.de/

---

## 🚀 Quick Start (Local Development)

### Step 1: Clone & Navigate
```bash
cd E:\AEGISCHAIN
```

### Step 2: Setup Backend

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
Copy .env.example to .env and update:
# - GROQ_API_KEY=your_groq_key
# - SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
# - GUARDRAIL_CONTRACT=0x... (after deployment)
# - AGENT_REGISTRY_CONTRACT=0x... (after deployment)
# - AUDIT_TRAIL_CONTRACT=0x... (after deployment)

# Start backend server
uvicorn app.main:app --reload --port 8000
```

### Step 3: Setup Frontend

```bash
# Navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Configure environment
Copy .env.example to .env.local and update:
# - NEXT_PUBLIC_API_URL=http://localhost:8000
# - NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Start development server
npm run dev
```

**Frontend** runs on: http://localhost:3000

### Step 4: Deploy Smart Contracts

```bash
# Navigate to blockchain
cd ../blockchain

# Install dependencies
npm install

# Create .env file with:
# SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
# PRIVATE_KEY=your_wallet_private_key

# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Save contract addresses to backend .env
```

### Step 5: Setup AI Agents

```bash
# Navigate to AI agents
cd ../ai-agents

# Create virtual environment
python -m venv venv
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
Copy .env.example to .env and update:
# - GROQ_API_KEY=your_groq_key
# - BACKEND_URL=http://localhost:8000
# - RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY

# Run demo
python demo.py

# Or run real agent scenarios
python main.py
```

---

## 🔌 MetaMask Integration

The system **automatically prompts MetaMask connection** when users visit:

1. **Landing Page** (`http://localhost:3000`)
   - Shows automatic MetaMask prompt after 500ms
   - Requires Sepolia testnet
   - Displays connected wallet in navbar

2. **How It Works**
   ```javascript
   // Automatic prompt on load
   useEffect(() => {
     if (!isConnected) {
       setTimeout(() => setShowMetaMaskPrompt(true), 500)
     }
   }, [isConnected])
   ```

3. **Required Setup**
   - Install MetaMask Chrome/Firefox extension
   - Add Sepolia testnet to MetaMask:
     - Network Name: Sepolia
     - RPC URL: https://sepolia.infura.io/v3/YOUR_KEY
     - Chain ID: 11155111
     - Currency: ETH

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                   │
│              🔐 MetaMask Wallet Integration             │
│         Automatic Connection on Page Load               │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/REST
                     ▼
┌─────────────────────────────────────────────────────────┐
│                 Backend (FastAPI)                       │
│   ┌──────────────────────────────────────────────────┐  │
│   │  LAYER 1: Pre-Transaction Guard                  │  │
│   │  - Prompt injection detection                    │  │
│   │  - Contract safety checks                        │  │
│   │  - Function signature validation                 │  │
│   └──────────────────────────────────────────────────┘  │
│   ┌──────────────────────────────────────────────────┐  │
│   │  LAYER 2: Runtime Guard (AI + Risk Engine)       │  │
│   │  - Groq LLM analysis                             │  │
│   │  - Risk scoring algorithm                        │  │
│   │  - Approval/Pending/Blocked decisions            │  │
│   └──────────────────────────────────────────────────┘  │
│   ┌──────────────────────────────────────────────────┐  │
│   │  LAYER 3: Post-Transaction Analysis              │  │
│   │  - Blockchain audit trail                        │  │
│   │  - Trust score adjustments                       │  │
│   │  - Event logging                                 │  │
│   └──────────────────────────────────────────────────┘  │
│                 SQLite Database                         │
└────────────────────┬────────────────────────────────────┘
                     │ Web3
                     ▼
┌─────────────────────────────────────────────────────────┐
│         Smart Contracts (Sepolia Testnet)               │
│  ┌─────────────────────────────────────────────────┐    │
│  │ GuardRail.sol - Main Security Contract          │    │
│  │ AgentRegistry.sol - Agent Trust Management      │    │
│  │ AuditTrail.sol - On-Chain Event Logging         │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Testing the System

### 1. Run Frontend Demo
```bash
cd frontend
npm run dev
# Visit http://localhost:3000
# Click "Get Started" to trigger MetaMask connection
```

### 2. Run AI Agent Demo
```bash
cd ai-agents
python demo.py
```

This executes:
- ✅ Legitimate DeFi transactions (should APPROVE)
- 🚨 Malicious attacks (should BLOCK)
- 📊 System metrics and summary

### 3. Test Individual Components

**Test Backend Directly:**
```bash
curl -X POST http://localhost:8000/api/v1/transactions/validate \
  -H "Content-Type: application/json" \
  -d '{
    "agent_address": "0xDeFiAgent0000000000000000000000000001",
    "target_address": "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
    "value_eth": 0.1,
    "intent": "Swap ETH for USDC on Uniswap",
    "protocol": "Uniswap"
  }'
```

**Check Backend Health:**
```bash
curl http://localhost:8000/health
```

---

## 📁 Project Structure

```
E:/AEGISCHAIN/
├── frontend/                    # Next.js React App
│   ├── app/
│   │   ├── page.tsx            # Landing page with MetaMask prompt
│   │   ├── layout.tsx          # Root layout with WalletProvider
│   │   └── (dashboard)/        # Protected dashboard routes
│   ├── context/
│   │   └── WalletContext.tsx   # MetaMask wallet management
│   ├── components/
│   │   ├── WalletButton.tsx    # Connect/Disconnect button
│   │   └── ...
│   ├── lib/
│   │   └── api.ts             # Backend API client
│   ├── .env.local             # Frontend environment variables
│   └── package.json
│
├── backend/                     # FastAPI Python Server
│   ├── app/
│   │   ├── main.py            # FastAPI app entry
│   │   ├── api/routes/        # API endpoints
│   │   ├── services/          # Business logic
│   │   │   ├── guardrail_engine.py     # Core protection logic
│   │   │   ├── risk_scorer.py          # Risk calculation
│   │   │   └── ...
│   │   ├── models/            # Pydantic models
│   │   ├── db/                # Database setup
│   │   └── core/
│   │       └── config.py      # Settings via environment
│   ├── .env                   # Backend environment variables
│   ├── requirements.txt
│   └── aegischain.db          # SQLite database (auto-created)
│
├── ai-agents/                  # Autonomous Agent Scripts
│   ├── agents/
│   │   ├── base_agent.py      # Base agent class
│   │   ├── defi_agent.py      # Legitimate agent
│   │   └── malicious_agent.py # Attack scenarios
│   ├── guardrails/            # Local security checks
│   ├── llm/                   # Groq LLM integration
│   ├── utils/                 # Helper functions
│   ├── demo.py               # Live demo script
│   ├── main.py               # Real agent scenarios
│   ├── .env                  # AI agent environment
│   └── requirements.txt
│
├── blockchain/                # Hardhat Project
│   ├── contracts/
│   │   ├── GuardRail.sol      # Main security contract
│   │   ├── AgentRegistry.sol  # Agent trust management
│   │   └── AuditTrail.sol     # Event logging
│   ├── scripts/
│   │   └── deploy.js          # Deployment script
│   ├── test/
│   │   └── aegischain.test.js
│   ├── .env                   # Blockchain deployment keys
│   ├── hardhat.config.js
│   └── package.json
│
└── shared/                     # Shared Resources
    └── contract_abis/         # Contract interfaces
        ├── GuardRail.json
        ├── AgentRegistry.json
        └── AuditTrail.json
```

---

## 🔐 Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files to git
- ✅ Use different keys for dev/staging/production
- ✅ Rotate API keys regularly
- ✅ Use hardware wallet for mainnet deployments

### Contract Security
- ✅ Contracts use OpenZeppelin standards
- ✅ ReentrancyGuard to prevent exploits
- ✅ OnlyOwner and OnlyGuardRail modifiers
- ✅ Input validation on all functions

### API Security
- ✅ CORS configured for frontend only
- ✅ Rate limiting on endpoints
- ✅ Request validation with Pydantic
- ✅ Error messages don't leak system details

---

## 🚨 Troubleshooting

### Backend Won't Start
```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill process if needed
taskkill /PID <PID> /F

# Ensure .env file exists
Copy .env.example to .env
```

### Frontend Can't Connect to Backend
- Check NEXT_PUBLIC_API_URL in .env.local
- Ensure backend is running on http://localhost:8000
- Check CORS settings in backend

### MetaMask Prompt Not Showing
- Browser console for errors (F12)
- Ensure MetaMask extension is installed
- Check window.ethereum availability
- Clear browser cache and reload

### Smart Contracts Won't Deploy
- Ensure PRIVATE_KEY is set in blockchain/.env
- Check Sepolia testnet ETH balance
- Verify RPC URL is correct

### Demo.py Errors
- Ensure BACKEND_URL=http://localhost:8000
- Verify GROQ_API_KEY is valid
- Check backend is running and healthy

---

## 📈 Production Deployment

### Pre-Deployment Checklist
- [ ] All environment variables configured
- [ ] Smart contracts audited
- [ ] Backend thoroughly tested
- [ ] Frontend security review
- [ ] Rate limiting configured
- [ ] Database backups enabled
- [ ] Monitoring and logging setup
- [ ] API documentation updated

### Deployment Steps
1. Deploy contracts to Mainnet
2. Update contract addresses in backend
3. Deploy backend to cloud (AWS/GCP/Azure)
4. Deploy frontend to Vercel/Netlify
5. Configure custom domain
6. Setup SSL certificates
7. Enable WAF and DDoS protection
8. Configure alerting and monitoring

---

## 📚 API Documentation

### Backend Endpoints

#### Validate Transaction
```http
POST /api/v1/transactions/validate
Content-Type: application/json

{
  "agent_address": "0x...",
  "target_address": "0x...",
  "value_eth": 0.1,
  "function_sig": "0xa9059cbb",
  "intent": "Swap ETH for USDC",
  "protocol": "Uniswap"
}
```

**Response:**
```json
{
  "tx_id": "0x...",
  "decision": "APPROVED",
  "risk_level": "LOW",
  "risk_score": 15,
  "ai_explanation": "Transaction approved...",
  "checks_passed": [...],
  "checks_failed": [],
  "timestamp": "2026-02-18T..."
}
```

#### Get Transaction History
```http
GET /api/v1/transactions/history?limit=50
```

#### Get Dashboard Stats
```http
GET /api/v1/transactions/stats
```

#### Get Audit Logs
```http
GET /api/v1/audit/logs?limit=100
```

---

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test
3. Commit: `git commit -am "Add feature"`
4. Push: `git push origin feature/your-feature`
5. Create Pull Request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🆘 Support

For issues and questions:
- 📧 Email: support@aegischain.io
- 💬 Discord: [Join our community]
- 📖 Docs: https://docs.aegischain.io

---

## 🎯 Roadmap

### v1.0 (Current)
- ✅ Three-layer guardrail system
- ✅ MetaMask integration
- ✅ Risk scoring engine
- ✅ Audit trail logging

### v1.1 (Planned)
- [ ] Advanced ML risk models
- [ ] Multi-chain support
- [ ] User dashboard improvements
- [ ] Mobile app

### v2.0 (Future)
- [ ] Decentralized governance
- [ ] Cross-chain security
- [ ] Advanced analytics
- [ ] Custom risk policies

---

**Made with ❤️ by the AegisChain Team**

Last Updated: February 18, 2026
