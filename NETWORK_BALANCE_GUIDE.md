# 🌐 Check Network & Balance - Quick Guide

## Overview
You can now easily check whether you're using **Sepolia Testnet** (test ETH) or **Ethereum Mainnet** (real ETH), along with your balance on that network.

---

## 🔍 Where to Check

### **1. Top Right - Network Badge**
Look at the header for the network indicator:
- **Orange badge**: Sepolia Testnet ✓ (Safe for testing)
- **Gray/Dark badge**: Ethereum Mainnet ⚠️ (Real funds!)

### **2. Wallet Dropdown Menu**
Click your address in the top-right corner:
- Shows network name and chain ID
- Shows current balance in ETH
- Warning/Info about mainnet vs testnet

### **3. Send Page - Network Info Card**
When on the `/send` page:
- Large network status card at the top
- Shows Network name, Balance, and Status
- Clear warning if on mainnet

---

## 📊 Network Information

### **Sepolia Testnet (Testing)**
- **Chain ID**: 11155111
- **Badge Color**: Orange
- **Status**: ✓ Testnet (Safe)
- **Balance**: Test ETH (no real value)
- **Purpose**: Testing transactions safely

### **Ethereum Mainnet (Real)**
- **Chain ID**: 1
- **Badge Color**: Gray/Default
- **Status**: ⚠️ Mainnet (Real funds!)
- **Balance**: Actual ETH (has real value)
- **Purpose**: Real transactions with actual money

---

## 💡 How It Works

### Network Detection
The system automatically detects your MetaMask network:
1. You connect MetaMask wallet
2. System reads the chain ID from your wallet
3. Displays network name and status
4. Refreshes automatically if you switch networks

### Balance Fetching
1. When you connect wallet
2. System fetches balance on current network
3. Shows in header next to address
4. Refreshes every time network updates

---

## Step-by-Step: Check Your Network

### **Step 1: Connect Wallet**
- Click blue "Connect" button in top-right
- Approve in MetaMask popup

### **Step 2: Look at Network Badge**
In the header, you'll see:
- Network name badge (orange or gray)
- Your address with balance below it

### **Step 3: Click Wallet Button**
Click your address to see dropdown with:
- **Network section** at top showing:
  - Network name (e.g., "Sepolia Testnet")
  - Chain ID
  - ✓ Testnet or ⚠️ Mainnet indicator

### **Step 4: View Detailed Info**
Click the `/send` page for a large card showing:
- Network name
- Your balance
- Status (Safe/Real)
- Helpful warning or info

---

## 🔄 What Network Info You Get

| Info | Where | Updates |
|------|-------|---------|
| Network Name | Header badge + Dropdown | Auto |
| Chain ID | Wallet dropdown | Auto |
| Balance | Header + Dropdown + Send page | Auto |
| Mainnet Warning | Dropdown + Send page | Auto |
| Status (Testnet/Mainnet) | All locations | Auto |

---

## ⚡ Quick Reference

### Network at a Glance

**SEPOLIA (Testnet)**
```
Network Badge: Orange
Chain ID: 11155111
Balance: Test ETH
Status: ✓ Safe for testing
```

**MAINNET (Ethereum)**
```
Network Badge: Gray
Chain ID: 1
Balance: Real ETH
Status: ⚠️ Real funds!
```

---

## 🚀 Common Scenarios

### Scenario 1: "Am I on Testnet?"
**Check here:**
1. Look at header badge (orange = Sepolia ✓)
2. Or click wallet → see "Sepolia Testnet"
3. Or go to /send page → see status card

### Scenario 2: "What's my balance?"
**Check here:**
1. Look at header wallet button (shows ETH amount)
2. Click dropdown for more precise balance
3. Or go to /send page for detailed balance info

### Scenario 3: "I want to switch networks"
**Steps:**
1. Open MetaMask
2. Click network selector (currently shows your network)
3. Select different network (Sepolia or Mainnet)
4. Page auto-updates to show new network
5. Balance refreshes for new network

---

## 🔐 Important Notes

### ✓ What's Safe
- Testing on Sepolia Testnet
- Small transactions on testnet
- Viewing your wallet info

### ⚠️ What's Risky
- Sending real transactions on mainnet without checking network
- Confusing testnet with mainnet balances
- Sending to wrong network

### 🛑 What to Avoid
- Connecting mainnet wallet if you only have testnets
- Sending real ETH by accident
- Ignoring the network warnings

---

## 📱 Visual Indicators

### Header Network Badge
```
Sepolia Testnet          (Orange background)
ℹ️ Safe for testing

Ethereum Mainnet         (Gray background)
⚠️ Real funds!
```

### Wallet Dropdown Details
```
┌─────────────────────┐
│ NETWORK             │
│ Sepolia Testnet     │
│ Chain ID: 11155111  │
│ ✓ Testnet          │
├─────────────────────┤
│ CONNECTED ACCOUNT   │
│ 0x123...456         │
├─────────────────────┤
│ BALANCE             │
│ 0.5 ETH             │
│ ℹ️ Testnet balance  │
├─────────────────────┤
│ Disconnect Wallet   │
└─────────────────────┘
```

### Send Page Info Card
```
┌──────────────────────────────┐
│ Network   │ 0.5 ETH │ ✓ Safe │
│ Sepolia   │ Balance │ Testnet│
│ Testnet   │ On Sepolia      │
│                              │
│ ℹ️ Connected to Sepolia      │
│ Testnet. Test ETH has no     │
│ real value.                  │
└──────────────────────────────┘
```

---

## 🎓 Understanding Chain IDs

Common networks and their IDs:
```
1          = Ethereum Mainnet (REAL)
5          = Goerli Testnet (old)
11155111   = Sepolia Testnet (current, RECOMMENDED)
31337      = Hardhat Local (development)
```

**For this project, you should use:**
- ✅ **11155111 (Sepolia)** - Main testnet for development
- ❌ **1 (Mainnet)** - Only if you intend to use real ETH

---

## 🔧 How Balance is Calculated

1. **Fetch**: System queries blockchain for your address
2. **Convert**: Wei (smallest unit) → ETH (human readable)
3. **Display**: Shows in multiple places
4. **Refresh**: Updates when:
   - Network changes
   - Account changes
   - Balance updates on blockchain

**Formula**: 1 ETH = 1,000,000,000,000,000,000 Wei (10^18)

---

## ✅ Verification Checklist

After connecting wallet, verify:
- [ ] You see a network badge in header
- [ ] Badge shows correct network name
- [ ] Balance displays in header next to address
- [ ] Clicking wallet shows detailed network info
- [ ] Chain ID displayed correctly
- [ ] Wallet dropdown shows appropriate warning/info
- [ ] On send page, info card is visible
- [ ] Network status is accurate (Testnet/Mainnet)

---

## 🎯 Best Practice

**Before every transaction:**
1. ✓ Check network badge (is it Sepolia?)
2. ✓ Confirm balance is sufficient
3. ✓ Review dropdownfor chain ID (should be 11155111)
4. ✓ On send page, verify status is "Testnet"
5. ✓ Then proceed with sending

---

## 💬 Example Conversations

### "Are my funds real?"
If network shows **Orange badge** + **Sepolia** = NO, they're test funds.
If network shows **Gray badge** + **Chainnet** = YES, they're real.

### "Why do I see different balance?"
Could be on different network. Check the network badge and switch if needed.

### "What if mainnet is showing?"
Look at the gray badge or dropdownand it say "Ethereum Mainnet" - switch to Sepolia in MetaMask.

---

## 🔗 Links & Resources

- **Sepolia Faucet**: https://sepoliafaucet.com/
- **Sepolia Explorer**: https://sepolia.etherscan.io/
- **MetaMask**: https://metamask.io/

---

## Summary

**Network Check Feature Includes:**
- ✅ Header badge showing network
- ✅ Wallet dropdown with details
- ✅ Send page info card
- ✅ Auto-detection of chain
- ✅ Real-time balance display
- ✅ Mainnet warnings
- ✅ Clear Testnet indicators

**You can now confidently check:**
- Which network you're connected to
- Your balance on that network
- Whether funds are real or test
- Important chain information

**Always double-check before sending transactions!**
