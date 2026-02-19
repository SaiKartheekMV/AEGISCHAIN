# 🚀 Real Transaction Feature Implementation

## Overview
You now have a complete real transaction system where users can send actual ETH between MetaMask accounts with **Guard AI analysis** before each transaction is broadcast to the blockchain.

---

## ✨ What's New

### 1. **Send Transaction Page** (`/send`)
- New UI page for sending real ETH transactions
- Found in the left sidebar navigation
- Two tabs:
  - **Send ETH**: Form to create and send transactions
  - **How It Works**: Educational guide about the transaction flow

### 2. **Send Transaction Form Component**
Location: `frontend/components/SendTransactionForm.tsx`

**Features:**
- Recipient address input (validates Ethereum address format)
- Amount input (in ETH, decimal support)
- Optional intent/description field (helps Guard AI understand context)
- Real-time wallet connection status
- Detailed result display with:
  - Transaction hash (on-chain receipt)
  - Risk score & level
  - Guard AI analysis explanation
  - Block reasons (if transaction blocked)
  - Transaction ID for audit tracking

### 3. **Enhanced Guardrail Transaction Handler**
Location: `frontend/lib/guardedTx.ts`

**Improvements:**
- Robust ETH to Wei conversion (handles floating-point precision)
- Better error handling for MetaMask rejections
- Comprehensive validation before sending
- Automatic backend notification with tx hash

---

## 🔄 Transaction Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      User Action                            │
│         1. Connect MetaMask (if not connected)              │
│         2. Fill in recipient address & amount               │
│         3. Click "Send Transaction"                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend Guard AI Analysis                       │
│              POST /api/v1/transactions/validate              │
│                                                              │
│   Analysis includes:                                        │
│   • Agent trust score check                                 │
│   • Daily spending limit verification                       │
│   • Recipient address reputation check                      │
│   • Risk pattern detection                                  │
│   • Blacklist/whitelist verification                        │
│   • AI explanation generation                               │
└──────────────────────┬──────────────────────────────────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼ APPROVED                  ▼ BLOCKED/PENDING
         │                           │
         │ ✅ Approved               ❌ Rejected
         │                           │
         ▼                           ▼
    MetaMask                    Display Error
    Signing                      & Reason
    Prompt
         │
         ▼
    User Approves
    (or Cancels)
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│               Broadcast to Blockchain                        │
│              (Real ETH Transfer on Sepolia)                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         Notify Backend of On-Chain Transaction              │
│    POST /api/v1/transactions/notify (with tx hash)          │
│                                                              │
│   Backend logs:                                             │
│   • Transaction hash                                        │
│   • Block number (once confirmed)                           │
│   • Post-transaction risk re-assessment                     │
│   • Audit trail entry                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Risk Assessment Factors

The Guard AI analyzes the following factors:

| Factor | Weight | Details |
|--------|--------|---------|
| **Agent Trust Score** | Critical | Historical behavior & success rate |
| **Daily Limit** | High | Prevents large cumulative daily exposure |
| **Transaction Value** | High | >1 ETH = high risk, >0.5 ETH = medium risk |
| **Recipient Address** | High | Checks blacklist, whitelist, reputation |
| **Intent/Protocol** | Medium | Context helps AI understand purpose |
| **Function Signature** | Medium | Detects suspicious patterns |
| **Time-based Anomalies** | Low | Unusual timing patterns |

---

## 🎯 Decision Logic

### ✅ APPROVED
- Transaction is safe based on all factors
- MetaMask prompt is shown immediately
- Transaction executed automatically upon user approval
- Result: Live on-chain transfer

### ⏳ PENDING
- High risk + high value combination
- Requires manual review by administrators
- User is notified to wait for approval
- Never auto-executes

### ❌ BLOCKED
- Critical security issues detected
- Possible causes:
  - Recipient is blacklisted
  - Risk score exceeds threshold (>75)
  - Agent trust score is critically low
  - Daily limit exceeded
- Transaction never reaches MetaMask

---

## 💡 Usage Example

### Scenario: Send 0.05 ETH to Friend

1. **Navigate to Send Page**
   - Click "Send" in left sidebar
   - Or visit `http://localhost:3000/send`

2. **Fill in Details**
   ```
   Recipient: 0x742d35Cc6634C0532925a3b844Bc9e7595f42938
   Amount: 0.05 ETH
   Intent: Sending ETH to friend's wallet
   ```

3. **Submit Form**
   - Backend validates transaction (~2 seconds)
   - Shows "🔍 Analyzing transaction with Guard AI..."

4. **View Results**
   - Risk Score: 15/100 (LOW)
   - Risk Level: LOW
   - AI Explanation: "Low amount to known address, approved"

5. **Approve in MetaMask**
   - MetaMask popup appears
   - Review transaction details
   - Click "Confirm"

6. **Transaction Broadcast**
   - Tx hash displayed: `0x1234...`
   - Transaction recorded in audit logs
   - Appears in Transaction History page

---

## 🔐 Security Features

1. **Multi-Layer Validation**
   - Pre-transaction analysis by Guard AI
   - Blockchain-level contract checks
   - Post-transaction verification possible

2. **Audit Trail**
   - Every transaction logged in database
   - Decision reasoning stored
   - Transaction hash linked for on-chain verification

3. **Blacklist/Whitelist System**
   - Automatic protection against known threats
   - Administrator can update lists
   - Real-time enforcement

4. **Rate Limiting**
   - Daily spending limits per agent
   - Prevents large cumulative exposure
   - Resets based on time window

---

## 📱 Frontend Components Created

### `SendTransactionForm.tsx`
- Main form for transaction input
- Handles validation and submission
- Displays detailed result information
- Error handling and user feedback

### `/send` Page
- Full page with form and documentation
- "How It Works" educational tab
- Decision logic explanation
- Risk factor reference

### Updated `WalletContext.tsx`
- Exported context for use in other components
- Already provided all wallet functionality

### Hook: `useWallet`
- Custom hook for wallet state access
- Provides address, signer, connection status
- Easy integration in any component

---

## 🔌 API Endpoints Used

### POST `/api/v1/transactions/validate`
**Request:**
```json
{
  "agent_address": "0x123...",
  "target_address": "0x456...",
  "value_eth": 0.05,
  "intent": "Sending ETH to friend",
  "protocol": "Native ETH Transfer"
}
```

**Response:**
```json
{
  "tx_id": "0xabc123...",
  "decision": "APPROVED",
  "risk_level": "LOW",
  "risk_score": 15,
  "ai_explanation": "Low value transaction to non-suspicious address.",
  "checks_passed": ["Value within safe range", "Agent trust score good"],
  "checks_failed": [],
  "timestamp": "2026-02-18T10:30:00Z"
}
```

### POST `/api/v1/transactions/notify`
**Request:**
```json
{
  "tx_id": "0xabc123...",
  "tx_hash": "0xdef456..."
}
```

**Response:**
```json
{
  "message": "Notified successfully",
  "tx_id": "0xabc123...",
  "tx_hash": "0xdef456..."
}
```

### GET `/api/v1/transactions/history?limit=50`
- Returns recent transactions with full details
- Viewable in Transaction History page

---

## 🧪 Testing the Feature

### On Sepolia Testnet

1. **Get Test ETH**
   - Visit [Sepolia Faucet](https://sepoliafaucet.com/)
   - Get free test ETH for your MetaMask account

2. **Create Test Accounts**
   - Use multiple MetaMask accounts for testing
   - Switch between them to send to each other

3. **Test Different Scenarios**
   - Small amount (0.01 ETH) → Should be APPROVED
   - Large amount (5 ETH) → Might trigger HIGH risk
   - Unknown address → Depends on risk factors
   - Blacklisted address → Should be BLOCKED

4. **Monitor Results**
   - Check Transaction History page
   - Review AI explanations
   - Verify on-chain (use Sepolia Etherscan)

---

## 🚀 Production Considerations

When deploying to mainnet:

1. **Update Daily Limits** (`backend/app/core/config.py`)
   - Adjust `DAILY_LIMIT_ETH` based on protocol needs
   - Set `RISK_SCORE_BLOCK_THRESHOLD` appropriately

2. **Deploy Smart Contracts**
   - Deploy GuardRail, AgentRegistry, AuditTrail contracts
   - Update contract addresses in `.env`

3. **Security Hardening**
   - Implement rate limiting
   - Add request authentication
   - Enable HTTPS
   - Set up monitoring alerts

4. **Backend Database**
   - Set up production PostgreSQL instance
   - Enable transaction logging
   - Configure backups

---

## 🐛 Troubleshooting

### "MetaMask not installed"
- Install MetaMask extension from [metamask.io](https://metamask.io/)
- Refresh the page

### "Invalid recipient address"
- Ensure address is valid Ethereum checksum address (0x...)
- Length should be 42 characters

### "Amount must be greater than 0"
- Amount field cannot be 0 or negative

### "Transaction blocked by Guard AI"
- Check risk score and reasons
- Transaction is safe, but flagged by security rules
- Can be addressed by admin whitelist approval

### MetaMask shows but I can't sign
- Check your wallet has sufficient balance
- Check MetaMask is on Sepolia network
- Ensure browser console has no errors

---

## 📈 Monitoring & Analytics

Check these pages to monitor transactions:

1. **Dashboard** (`/dashboard`)
   - Overall transaction statistics
   - Risk level distribution

2. **Transactions** (`/transactions`)
   - Full transaction history
   - Filter by decision (APPROVED/BLOCKED/PENDING)
   - View detailed analysis for each tx

3. **Audit Logs** (`/audit`)
   - System-wide audit trail
   - Admin actions logged
   - Whitelist/blacklist changes

---

## 🎓 How Guard AI Works

The AI engine uses:

1. **Llama 3.3 70B Model** (via Groq API)
   - Analyzes transaction context
   - Generates human-readable explanations
   - ~2 second response time

2. **Rule-Based Heuristics**
   - Known malicious addresses
   - Suspicious function signatures
   - Anomaly detection

3. **On-Chain Data**
   - Agent trust scores from smart contracts
   - Historical transaction data
   - Blockchain state information

---

## 📝 Summary

**Real Transaction System Implementation Complete! ✅**

Users can now:
- ✅ Send real ETH between MetaMask accounts
- ✅ Get Guard AI analysis before each transaction
- ✅ See detailed risk assessments
- ✅ Receive blocklist/whitelist protection
- ✅ Track all transactions in audit history
- ✅ Monitor on-chain execution

**Next Steps:**
1. Test with Sepolia test ETH
2. Try different transaction amounts
3. Monitor Guard AI decisions
4. Review audit logs for patterns
5. Adjust guardrail rules as needed
