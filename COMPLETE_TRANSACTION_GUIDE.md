# 🚀 Complete Guide: Send Real Transactions with Guard AI & Network Support

This guide covers the entire real transaction system, including Guard AI analysis, auto-registration, network detection, and easy network switching.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Network Management](#network-management)
3. [Transaction Flow](#transaction-flow)
4. [Guard AI Analysis](#guard-ai-analysis)
5. [Risk Scoring](#risk-scoring)
6. [Troubleshooting](#troubleshooting)
7. [Advanced Features](#advanced-features)

---

## 🎯 Overview

### **What You Can Do Now**

✅ Send real ETH transactions to any Ethereum address  
✅ Transactions are automatically analyzed by Guard AI before sending  
✅ See risk assessment with detailed explanations  
✅ Approve or reject based on risk level  
✅ Automatically switch between Sepolia & Goerli testnets  
✅ View your balance on each network  
✅ All transactions logged for audit trail  

### **Main Components**

| Component | Purpose |
|-----------|---------|
| **Send Page** | Main UI for sending transactions |
| **SendTransactionForm** | Form with validation & MetaMask integration |
| **Guard AI** | Analyzes risk before transaction |
| **Risk Scorer** | Calculates transaction risk |
| **Network Switcher** | Easy testnet switching |
| **Wallet Context** | Manages network & balance state |

---

## 🌐 Network Management

### **Supported Networks**

#### **Sepolia (Recommended)**
```
Chain ID: 11155111
Network Type: Testnet
Status: ✅ Active (recommended)
Color Badge: 🟠 Orange
Use For: All new development & testing
Faucet: https://sepoliafaucet.com/
Explorer: https://sepolia.etherscan.io/
```

#### **Goerli (Legacy)**
```
Chain ID: 5
Network Type: Testnet
Status: ✅ Still active
Color Badge: 🟣 Purple
Use For: Backward compatibility
Faucet: https://goerlifaucet.com/
Explorer: https://goerli.etherscan.io/
```

### **How to Switch Networks**

**Method 1: Using Network Switcher (Recommended)**
```
1. Click network dropdown in header (top-right)
2. Select desired testnet (Sepolia or Goerli)
3. Confirm in MetaMask popup
4. Network switches automatically
5. Balance updates for new network
```

**Method 2: Manual MetaMask (Not Recommended)**
```
1. Click MetaMask wallet icon
2. Go to network dropdown
3. Select network manually
4. App detects change automatically
```

### **Network Indicators**

**Header Badge Shows:**
- Network name (e.g., "Sepolia")
- Color indicator (Orange = Sepolia, Purple = Goerli)
- Current chain ID on hover

---

## 💸 Transaction Flow

### **Step-by-Step Send Transaction**

#### **Step 1: Navigate to Send**
```
1. Click "Send" in sidebar menu
2. Fill in recipient address & amount
3. See current network in dropdown
```

#### **Step 2: Verify Details**
```
Display Shows:
├─ Current Network (Sepolia/Goerli)
├─ Your Address & Balance
├─ Gas Estimate
└─ Total Amount to Send
```

#### **Step 3: Auto-Registration (First Time Only)**
```
If you're new:
1. App detects unregistered agent
2. Shows "🔧 Registering your account..."
3. Auto-creates agent with trust score 60
4. Waits for registration complete
5. Then enables form
```

#### **Step 4: Validate Transaction**
```
Call to Guard AI:
1. Sends transaction details to backend
2. Backend calls Groq LLM
3. AI analyzes: amount, recipient, patterns
4. Returns risk score & explanation
5. Shows results to user
```

#### **Step 5: Review Risk**
```
Risk Display:
├─ Risk Score (0-100)
├─ Risk Level (LOW/MEDIUM/HIGH/CRITICAL)
├─ Visual Indicator (✓ Green/⚠️ Yellow/✗ Red)
└─ AI Explanation (why this risk level)
```

#### **Step 6: Approve or Reject**
```
User Choice:
├─ If LOW/MEDIUM: Can send
├─ If HIGH: May warn, but can send
├─ If CRITICAL: Blocked (can't send)
└─ Multiple rejections: Wait for cooldown
```

#### **Step 7: MetaMask Confirmation**
```
User Action:
1. Click "Send Transaction" button
2. MetaMask popup appears
3. Review transaction details
4. Click "Confirm" in MetaMask
5. Transaction broadcasts to network
```

#### **Step 8: Transaction Broadcast**
```
Backend:
1. Receives signed transaction
2. Logs to audit trail
3. Broadcasts to blockchain
4. Returns transaction hash
5. Watches for confirmation
```

#### **Step 9: Completion**
```
Frontend Shows:
├─ Transaction Hash (clickable to explorer)
├─ Status: Pending → Confirmed
├─ Block number
└─ "View on Etherscan" button
```

---

## 🤖 Guard AI Analysis

### **How Guard AI Works**

**Input to AI:**
```python
{
    "sender_address": "0x123...",
    "recipient_address": "0x456...",
    "amount_eth": 0.5,
    "network": "sepolia",
    "timestamp": "2024-01-15T10:30:00Z"
}
```

**AI Analysis Considers:**
- Transaction amount (in relation to user's typical activity)
- Recipient address (new address vs trusted)
- Time of day (unusual hour = higher risk)
- Frequency of transactions
- Daily limits
- Blacklist/whitelist status
- User's trust score
- Protocol safety

**AI Output:**
```python
{
    "risk_score": 15,
    "risk_level": "LOW",
    "explanation": "Small transaction to new address. Low risk due to amount and trust score.",
    "factors": {
        "amount_risk": "low",
        "recipient_risk": "medium",
        "pattern_risk": "low",
        "user_trust": "high"
    }
}
```

### **Risk Levels**

| Level | Score | Status | Action |
|-------|-------|--------|--------|
| **LOW** | 0-25 | ✓ Safe | Send directly |
| **MEDIUM** | 26-50 | ⚠️ Caution | Can send with warning |
| **HIGH** | 51-75 | ⚠️ Alert | Warning, but allowed |
| **CRITICAL** | 76-100 | ✗ Blocked | Blocked by guardrail |

### **Example Risk Assessments**

#### **Example 1: Safe Small Transaction**
```
Transaction: 0.1 ETH to address 0xabc123
Risk Score: 12/100 (LOW)
Explanation:
  ✓ Small amount (0.1 ETH)
  ✓ User has high trust (score 60+)
  ✓ Normal time pattern
  ✓ No recent flagged transactions
Decision: Approved immediately
```

#### **Example 2: Moderate Risk**
```
Transaction: 2.5 ETH to new address
Risk Score: 42/100 (MEDIUM)
Explanation:
  ⚠️ Larger amount (2.5 ETH)
  ⚠️ New recipient address
  ✓ User has moderate trust
  ✓ Within daily limits
Decision: Shows warning but allows
```

#### **Example 3: High Risk**
```
Transaction: 5 ETH to blacklisted address
Risk Score: 68/100 (HIGH)
Explanation:
  ✗ Large amount (5 ETH)
  ✗ Address on blacklist
  ⚠️ Exceeds daily limit
  ✓ User is registered
Decision: Shows strong warning, allows but tracks
```

#### **Example 4: Blocked**
```
Transaction: 10 ETH to unknown address at 3am
Risk Score: 92/100 (CRITICAL)
Explanation:
  ✗ Very large amount (10 ETH)
  ✗ New recipient address
  ✗ Unusual time (3am)
  ✗ Multiple red flags detected
Decision: BLOCKED - cannot proceed
```

---

## 📊 Risk Scoring System

### **Risk Calculation Factors**

#### **1. Amount Risk (40% weight)**
```
Low Risk:     < 0.5 ETH
Medium Risk:  0.5 - 2 ETH
High Risk:    2 - 5 ETH
Critical Risk: > 5 ETH
```

#### **2. Recipient Risk (30% weight)**
```
Whitelist:     0 risk
Known Address: 10 risk
New Address:   30 risk
Blacklist:     70+ risk
```

#### **3. User Trust (20% weight)**
```
High Trust (70+):   -20 risk (easier to approve)
Medium Trust (50):  0 risk (neutral)
Low Trust (30):     +20 risk (harder to approve)
New User (<20):     +30 risk (cautious)
```

#### **4. Pattern Risk (10% weight)**
```
Normal Time:       0 risk
Unusual Hour:      5 risk
Unusual Day:       10 risk
High Frequency:    15 risk
```

### **Daily Limits**

```
Based on User Trust:
├─ High Trust (70+):    10 ETH/day
├─ Medium Trust (50):   5 ETH/day
├─ Low Trust (30):      1 ETH/day
└─ New User (<20):      0.5 ETH/day
```

### **Trust Score Calculation**

```
Initial Score: 60 (new agent)

Increases by:
+ 5 per successful transaction
+ 2 per 24-hour window with no issues
+ 10 for whitelisted recipient

Decreases by:
- 10 per failed transaction
- 15 per rejected transaction
- 20 if blacklisted address used
- 30 per high-risk flagged transaction
```

---

## 🔄 Transaction Status States

### **Status Flow**

```
┌─────────────────────────────────────────────────┐
│ 1. PENDING_ANALYSIS                             │
│    Sending transaction to Guard AI              │
└─────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────┐
│ 2. ANALYZED                                     │
│    Guard AI returned risk assessment            │
│    User sees risk score & can approve/reject    │
└─────────────────────────────────────────────────┘
                          ↓ (if approved)
┌─────────────────────────────────────────────────┐
│ 3. PENDING_USER_CONFIRMATION                    │
│    MetaMask popup shown to user                 │
│    Waiting for user click in MetaMask           │
└─────────────────────────────────────────────────┘
                          ↓ (if confirmed)
┌─────────────────────────────────────────────────┐
│ 4. PENDING_BROADCAST                            │
│    Sending signed transaction to blockchain    │
│    Waiting for network to accept                │
└─────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────┐
│ 5. PENDING_CONFIRMATION                         │
│    Transaction in mempool waiting for block     │
│    Watching for confirmation                    │
└─────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────┐
│ 6. CONFIRMED                                    │
│    Transaction mined successfully              │
│    Shows transaction hash & block number        │
└─────────────────────────────────────────────────┘
```

---

## 🔐 Auto-Registration System

### **First-Time User Flow**

```
Step 1: Connect Wallet
├─ App detects your address
└─ Checks if registered in DB

Step 2: Check Registration
├─ If registered: Continue normally
└─ If NOT registered: Auto-register

Step 3: Auto-Register
├─ Call: POST /api/agents/auto-register/{address}
├─ Backend creates AgentRecord
├─ Sets initial trust_score: 60
├─ Logs registration event
└─ Returns success

Step 4: Enable Form
├─ SendTransactionForm becomes enabled
├─ All fields available for input
└─ Can now send transactions
```

### **What Gets Created**

```python
AgentRecord {
    address: "0x...",
    trust_score: 60,          # Initial score
    tx_count: 0,              # No transactions yet
    blocked_count: 0,         # No blocks yet
    created_at: "2024-01-15T10:30:00Z",
    updated_at: "2024-01-15T10:30:00Z",
    is_active: true,
    on_chain: false           # Not yet on blockchain
}
```

### **Why Auto-Register?**

✅ No manual signup required  
✅ Faster onboarding  
✅ Reduces support burden  
✅ Better user experience  
✅ Everyone gets fair initial trust score  

---

## 🎨 UI Components

### **Send Page Layout**

```
┌────────────────────────────────────────────────┐
│ Header                                         │
│ [Logo] [Sepolia ▼] [0x123...456 - 0.5 ETH]   │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ Main Content                                   │
│                                                │
│ ┌──────────────────────────────────────────┐  │
│ │ Send Transaction Tab                     │  │
│ ├──────────────────────────────────────────┤  │
│ │                                          │  │
│ │ Network: Sepolia (current)               │  │
│ │ Your Address: 0x123...456                │  │
│ │ Balance: 0.5 ETH                         │  │
│ │                                          │  │
│ │ Recipient Address: [____________]        │  │
│ │ Amount (ETH): [____________]             │  │
│ │                                          │  │
│ │ [Validate Transaction] (shows risk)      │  │
│ │                                          │  │
│ │ Risk Level: ✓ LOW (12/100)               │  │
│ │ Reason: Small transaction, trusted user │  │
│ │                                          │  │
│ │ [Send Transaction] [Cancel]              │  │
│ │                                          │  │
│ └──────────────────────────────────────────┘  │
│                                                │
│ ┌──────────────────────────────────────────┐  │
│ │ Transaction History Tab                  │  │
│ ├──────────────────────────────────────────┤  │
│ │ No transactions yet                      │  │
│ └──────────────────────────────────────────┘  │
│                                                │
└────────────────────────────────────────────────┘
```

### **Risk Badge Display**

```
LOW RISK:
┌──────────────────────────────────┐
│ ✓ LOW RISK (12/100)              │
│ Small transaction, trusted user  │
└──────────────────────────────────┘
(Green badge, can send)

MEDIUM RISK:
┌──────────────────────────────────┐
│ ⚠️ MEDIUM RISK (42/100)           │
│ New recipient address detected   │
└──────────────────────────────────┘
(Yellow badge, warning but allowed)

HIGH RISK:
┌──────────────────────────────────┐
│ ⚠️ HIGH RISK (68/100)             │
│ Large amount to new address      │
└──────────────────────────────────┘
(Orange badge, strong warning)

CRITICAL RISK:
┌──────────────────────────────────┐
│ ✗ CRITICAL RISK (92/100)         │
│ Transaction blocked by guardrail │
└──────────────────────────────────┘
(Red badge, blocked)
```

---

## 🚨 Troubleshooting

### **Problem: Form is Disabled**

**Possible Causes:**
- Not connected to wallet
- Wallet not on supported network
- Still registering (shows "🔧 Registering...")

**Solutions:**
```
1. Check wallet connection in header
2. Make sure on Sepolia or Goerli
3. Wait for registration to complete
4. Refresh page if still disabled
```

### **Problem: Transaction Always Gets HIGH Risk**

**Possible Causes:**
- Amount too large
- Address on blacklist
- Unusual time/pattern
- Low trust score

**Solutions:**
```
1. Try smaller amount (0.1-0.5 ETH)
2. Use known/whitelisted address
3. Try during normal business hours
4. Build trust with multiple small transactions
```

### **Problem: Balance Shows 0 ETH**

**Possible Causes:**
- Network switched but wallet has no balance
- Network detection issue
- Wallet empty on this network

**Solutions:**
```
1. Get free testnet ETH:
   - Sepolia: https://sepoliafaucet.com/
   - Goerli: https://goerlifaucet.com/
2. Wait for faucet to send (1-2 minutes)
3. Refresh page to update balance
4. Verify you're on correct network
```

### **Problem: MetaMask Popup Doesn't Appear**

**Possible Causes:**
- MetaMask popup hidden behind other windows
- MetaMask extension not responding
- MetaMask locked/disconnected

**Solutions:**
```
1. Check if MetaMask icon has notification badge
2. Click MetaMask icon in browser to bring to front
3. Unlock MetaMask if needed
4. Try transaction again
5. Refresh page and reconnect wallet
```

### **Problem: Transaction Rejected**

**Possible Causes:**
- High risk score (CRITICAL)
- Amount exceeds daily limit
- Address on blacklist
- Too many failed attempts

**Solutions:**
```
1. Try smaller amount
2. Use different recipient address
3. Wait a day for limits to reset
4. Check if address is blacklisted
5. Build trust with more transactions
```

---

## 🎓 Advanced Features

### **Customizing Risk Thresholds (Backend)**

Edit `backend/app/services/risk_scorer.py`:

```python
# Current thresholds
CRITICAL_THRESHOLD = 75   # > 75 = blocked
HIGH_THRESHOLD = 51       # > 51 = high risk
MEDIUM_THRESHOLD = 26     # > 26 = medium

# Change to adjust blocking behavior
```

### **Adding New Networks**

Edit `frontend/components/NetworkSwitcher.tsx`:

```typescript
const AVAILABLE_TESTNETS = [
    {
        chainId: 11155111,
        name: "Sepolia",
        color: "bg-orange-100",
        // Add new network here:
    },
    // Example: Add Mumbai
    // {
    //     chainId: 80001,
    //     name: "Mumbai",
    //     color: "bg-purple-100",
    // }
];
```

### **Viewing Audit Logs**

All transactions logged in backend:
```python
# Backend stores:
├─ Transaction hash
├─ Sender address
├─ Recipient address
├─ Amount
├─ Risk score
├─ Decision (approved/rejected/blocked)
├─ Guard AI explanation
├─ Timestamp
└─ Block number (after confirmation)
```

Access via:
```
Backend: /api/transactions/ (GET)
Audit Trail: Smart contract on blockchain
```

### **Exporting Transaction History**

```
Features (can add):
├─ CSV export
├─ JSON export
├─ Filter by date range
├─ Filter by address
├─ Filter by risk level
└─ Search by hash
```

---

## 📚 Architecture Overview

### **System Components**

```
┌─────────────────────────────────────────────────┐
│ Frontend (Next.js + TypeScript)                 │
├─────────────────────────────────────────────────┤
│ ├─ SendTransactionForm (UI)                    │
│ ├─ NetworkSwitcher (Network selection)         │
│ ├─ WalletContext (State management)            │
│ └─ API Client (HTTP requests)                  │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────▼─────────┐
        │   Backend API    │
        │   (FastAPI)      │
        ├──────────────────┤
        │ ├─ Validate TX   │
        │ ├─ Score Risk    │
        │ └─ Log Audit     │
        └────────┬──────────┘
                 │
        ┌────────▼─────────────┐
        │ External Services    │
        ├──────────────────────┤
        │ ├─ Groq LLM (Risk)  │
        │ ├─ Web3/Ethers      │
        │ ├─ PostgreSQL (DB)  │
        │ └─ Blockchain RPC   │
        └──────────────────────┘
```

### **Data Flow**

```
User Action (Click "Validate Transaction")
        ↓
Check if registered (auto-register if needed)
        ↓
Format transaction details
        ↓
Call: POST /api/transactions/validate
        ↓
Backend receives transaction data
        ↓
Query agent trust score from DB
        ↓
Calculate risk factors
        ↓
Call Groq LLM for analysis
        ↓
Get risk score + explanation
        ↓
Return to frontend
        ↓
Display risk to user
        ↓
User approves or rejects
        ↓
If approved: Request MetaMask signature
        ↓
MetaMask signs transaction
        ↓
Broadcast to blockchain
        ↓
Log to audit trail
        ↓
Watch for confirmation
        ↓
Show success with hash
```

---

## 🔗 Quick Links

| Resource | URL |
|----------|-----|
| **Sepolia Faucet** | https://sepoliafaucet.com/ |
| **Goerli Faucet** | https://goerlifaucet.com/ |
| **Sepolia Explorer** | https://sepolia.etherscan.io/ |
| **Goerli Explorer** | https://goerli.etherscan.io/ |
| **MetaMask** | https://metamask.io/ |
| **Ethers.js Docs** | https://docs.ethers.org/ |

---

## ✅ Summary

You now have a complete real transaction system with:

✅ **Network Support**: Easy switching between Sepolia & Goerli  
✅ **Guard AI Analysis**: Automatic risk assessment before sending  
✅ **Auto-Registration**: New users automatically set up  
✅ **Risk Scoring**: Multi-factor risk calculation  
✅ **Audit Trail**: All transactions logged  
✅ **User-Friendly UI**: Simple but powerful interface  

**Start by:**
1. Getting testnet ETH from faucet
2. Using Network Switcher to confirm you're on Sepolia
3. Filling in recipient address and amount
4. Clicking "Validate" to see risk assessment
5. Sending the transaction!

Happy testing! 🚀
