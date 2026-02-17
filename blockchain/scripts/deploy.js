const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // 1. Deploy AgentRegistry
  console.log("\n📋 Deploying AgentRegistry...");
  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const registry = await AgentRegistry.deploy();
  await registry.waitForDeployment();
  console.log("✅ AgentRegistry:", await registry.getAddress());

  // 2. Deploy GuardRail (maxTx=1 ETH, dailyLimit=5 ETH, highValue=0.5 ETH)
  console.log("\n🛡️  Deploying GuardRail...");
  const GuardRail = await ethers.getContractFactory("GuardRail");
  const guardrail = await GuardRail.deploy(
    await registry.getAddress(),
    1,    // max tx: 1 ETH
    5,    // daily limit: 5 ETH
    0     // high value threshold: 0.5 ETH (set via updateThresholds)
  );
  await guardrail.waitForDeployment();
  console.log("✅ GuardRail:", await guardrail.getAddress());

  // 3. Deploy AuditTrail
  console.log("\n📜 Deploying AuditTrail...");
  const AuditTrail = await ethers.getContractFactory("AuditTrail");
  const audit = await AuditTrail.deploy();
  await audit.waitForDeployment();
  console.log("✅ AuditTrail:", await audit.getAddress());

  // 4. Save addresses to file (backend will read this)
  const addresses = {
    AgentRegistry: await registry.getAddress(),
    GuardRail: await guardrail.getAddress(),
    AuditTrail: await audit.getAddress(),
    network: "sepolia",
    deployedAt: new Date().toISOString()
  };

  const fs = require("fs");
  fs.writeFileSync("deployed-addresses.json", JSON.stringify(addresses, null, 2));
  console.log("\n💾 Addresses saved to deployed-addresses.json");
  console.log("\n🚀 AegisChain Blockchain Layer LIVE on Sepolia!");
}

main().catch((e) => { console.error(e); process.exit(1); });