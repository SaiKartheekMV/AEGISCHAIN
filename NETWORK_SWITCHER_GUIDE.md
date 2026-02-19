# 🌐 Network Switcher - Easy Testnet Switching

## Overview
You can now easily switch between different testnets directly from the app without needing to go into MetaMask settings!

---

## 📍 Where to Find the Network Switcher

### **Location: Top Right Header**
Look next to your wallet button in the header:
- **Network Badge** (shows current network in color)
- **Network Switcher Dropdown** (with small arrow ▼)

---

## 🔄 How to Switch Networks

### **Step 1: Look for the Network Switcher**
In the top-right header, you'll see:
```
[Current Network ▼]  [Your Address & Balance]
```

### **Step 2: Click the Dropdown Arrow**
Click the small arrow (▼) next to your network name

### **Step 3: Select Network**
A dropdown menu appears with available testnets:
- ✓ **Sepolia** (currently selected, marked with checkmark)
- **Goerli** (click to switch)

### **Step 4: Wait for Switch**
- MetaMask prompts to confirm
- Network switches automatically
- App updates with new chain ID and balance

---

## 🟠 Available Testnets

### **Sepolia** (Recommended)
- **Chain ID**: 11155111
- **Status**: ✓ Active & Recommended
- **Color**: Orange
- **Best for**: Current testing & development

### **Goerli** (Legacy)
- **Chain ID**: 5
- **Status**: ✓ Still active
- **Color**: Purple
- **Note**: Being phased out, use Sepolia instead

---

## 🎯 Quick Steps

1. ✅ See current network in header
2. ✅ Click the dropdown arrow
3. ✅ Select new testnet (Sepolia/Goerli)
4. ✅ Confirm in MetaMask popup
5. ✅ Network changes automatically
6. ✅ Balance updates for new network

---

## 📊 What Changes When You Switch

When you switch networks:

| Changes | Details |
|---------|---------|
| **Network Badge** | Updates color and name |
| **Chain ID** | Shown in wallet dropdown |
| **Balance** | Fetches new balance on new network |
| **Transactions** | New transactions go to new network |
| **History** | Separate history per network |

---

## 🔍 Visual Guide

### Network Switcher in Header
```
┌────────────────────────────────────────────┐
│ Backend  [Sepolia ▼] [0x123...456] Token  │
│  Online                   0.5 ETH          │
└────────────────────────────────────────────┘
           ↓ Click here to switch
```

### Dropdown Menu
```
┌─────────────────────┐
│ ✓ Sepolia (current) │
│   Goerli            │
└─────────────────────┘
```

---

## ⚡ Features

### **Auto-Switching**
- ✅ No manual configuration needed
- ✅ MetaMask handles everything
- ✅ Auto-adds network if not in MetaMask

### **Smart Detection**
- ✅ Detects if network is missing
- ✅ Automatically adds it to MetaMask
- ✅ Switches in one click

### **Real-Time Updates**
- ✅ Balance updates instantly
- ✅ Chain ID reflects immediately
- ✅ UI updates automatically

### **Visual Feedback**
- ✅ Current network highlighted with checkmark
- ✅ Color-coded by network
- ✅ Loading state while switching

---

## 🔐 Safety Features

### **Current Network Always Visible**
- Shows in header badge
- Color-coded for quick recognition
- Displays chain ID when clicked

### **Confirmation Required**
- MetaMask popup confirms switch
- You can cancel anytime
- No accidental network changes

### **Warning Indicators**
- ⚠️ Alert icon if not on Sepolia
- ✓ Confirmation if on Sepolia
- Clear status messages

---

## 💡 Use Cases

### **Scenario 1: Testing on Different Network**
1. Click network dropdown
2. Select Goerli
3. Test transactions there
4. Get different Goerli testnet ETH
5. Run tests on that network

### **Scenario 2: Checking Balance on Different Network**
1. Switch to Goerli
2. Your balance updates automatically
3. See how much Goerli ETH you have
4. Switch back to Sepolia

### **Scenario 3: Troubleshooting**
1. Not sure which network you're on?
   - Check the header badge (shows network name)
2. Want to go back to Sepolia?
   - Click dropdown and select Sepolia
3. Network not appearing?
   - Click it anyway - app will add it automatically

---

## 🚀 Switching Step-by-Step

### **To Switch from Sepolia to Goerli:**

1. **See header shows**: "Sepolia" badge
2. **Click the dropdown arrow** next to it
3. **Menu appears** with options
4. **Click "Goerli"**
5. **MetaMask prompts** "Switch to Goerli?"
6. **Click "Switch"** in MetaMask
7. **Wait** 1-2 seconds
8. **Header updates** to show "Goerli"
9. **Balance updates** for Goerli network
10. ✅ **Done!** Now on Goerli testnet

---

## ✅ Verification Checklist

After switching networks:

- [ ] Header badge shows new network name
- [ ] Badge color changed (Sepolia = Orange, Goerli = Purple)
- [ ] Chain ID in dropdown shows correct ID
- [ ] Balance updated (might be different)
- [ ] MetaMask also shows same network
- [ ] Current network has checkmark in dropdown
- [ ] Can send transactions on new network

---

## ⚠️ Important Notes

### **Balance May Differ**
- Each network has separate balance
- You need testnet ETH on each network
- Sepolia balance ≠ Goerli balance

### **Get Testnet ETH**
- **For Sepolia**: https://sepoliafaucet.com/
- **For Goerli**: https://goerlifaucet.com/

### **Transactions Are Network-Specific**
- Transaction on Sepolia ≠ on Goerli
- History separate per network
- Can't mix networks for single transaction

### **Always Verify Network Before Sending**
- Check header badge
- Confirm chain ID
- Make sure you're on intended network
- Then click Send

---

## 🔧 If Something Goes Wrong

### **Problem: Dropdown doesn't appear**
**Solution:**
1. Make sure you're connected (address shown in header)
2. Refresh page if disconnected
3. Reconnect wallet

### **Problem: Network won't switch**
**Solution:**
1. Check MetaMask for popup (might be hidden)
2. Click MetaMask icon to see popup
3. Approve the switch
4. Try again if it fails

### **Problem: Balance shows 0**
**Solution:**
1. Network might be correct but no balance
2. Get free testnet ETH from faucet:
   - Sepolia: https://sepoliafaucet.com/
   - Goerli: https://goerlifaucet.com/
3. Wait for faucet to send ETH

### **Problem: Can't find Goerli/Sepolia**
**Solution:**
1. Just click it anyway
2. App will automatically add it to MetaMask
3. No need to manually configure

---

## 📱 Visual Indicators

### **Header Network Selector**
```
Connected State:
┌──────────────────────────────────┐
│ Sepolia ▼  (Orange badge)        │
│ Click to see: Sepolia ✓, Goerli  │
└──────────────────────────────────┘

Switching State:
┌──────────────────────────────────┐
│ Switching...                       │
│ (Briefly shows while changing)    │
└──────────────────────────────────┘

After Switch:
┌──────────────────────────────────┐
│ Goerli ▼  (Purple badge)          │
│ Click to see: Sepolia, Goerli ✓  │
└──────────────────────────────────┘
```

---

## 🎓 Understanding Testnets

### **Why Multiple Testnets?**
- Test without using real money
- Different conditions for testing
- Separate test environments
- Always have one main (Sepolia)

### **Which Should I Use?**
- **Sepolia**: 95% of your testing
- **Goerli**: Legacy support, being phased out
- **Default**: Always use Sepolia

### **How Are They Different?**
- Same blockchain structure
- Different networks (separate state)
- Different faucets for free ETH
- Different transaction histories

---

## 🔗 Helpful Links

- **Switch Networks**: Use the dropdown in header ← You are here!
- **Get Sepolia ETH**: https://sepoliafaucet.com/
- **Get Goerli ETH**: https://goerlifaucet.com/
- **Sepolia Explorer**: https://sepolia.etherscan.io/
- **Goerli Explorer**: https://goerli.etherscan.io/

---

## 🎯 Best Practices

1. **Always Check Network Before Sending**
   - Look at header badge color
   - If uncertain, click wallet to verify chain ID
   - Then proceed

2. **Keep ETH on Multiple Networks**
   - Sepolia: For main testing
   - Goerli: For backup/additional testing
   - Both free via faucets

3. **Use Visual Indicators**
   - Orange = Sepolia ✓ (use this)
   - Purple = Goerli ✓ (legacy)

4. **Document Your Testing**
   - Note which network you're testing on
   - Keep track of test ETH amounts
   - Reference chain IDs if needed

---

## ✨ Summary

**Network Switcher Features:**
- ✅ Quick dropdown in header
- ✅ One-click network switching
- ✅ Auto-adds missing networks
- ✅ Real-time balance updates
- ✅ Visual network indicators
- ✅ No MetaMask settings needed
- ✅ Safe switching with confirmation

**Available Testnets:**
- ✅ Sepolia (Chain ID: 11155111) - Recommended
- ✅ Goerli (Chain ID: 5) - Legacy support

**You can now easily test on any testnet without leaving the app!** 🚀
