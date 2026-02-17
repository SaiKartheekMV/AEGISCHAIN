const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AegisChain GuardRail System", function () {

  let registry, guardrail, audit;
  let owner, agent1, maliciousAddr;

  beforeEach(async function () {

    [owner, agent1, maliciousAddr] = await ethers.getSigners();

    // Deploy Registry
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    registry = await AgentRegistry.deploy();

    // Deploy GuardRail
    const GuardRail = await ethers.getContractFactory("GuardRail");
    guardrail = await GuardRail.deploy(
      await registry.getAddress(),
      1,  // maxTxValue (1 ETH)
      5,  // dailyLimit (5 ETH)
      0   // highValueThreshold (0 ETH)
    );

    // 🔥 VERY IMPORTANT: Connect Registry → GuardRail
    await registry.setGuardRail(await guardrail.getAddress());

    // Deploy Audit
    const AuditTrail = await ethers.getContractFactory("AuditTrail");
    audit = await AuditTrail.deploy();

    await registry.setGuardRail(guardrail.target);
  });

  it("Should register an agent and mark as trusted", async function () {
    await registry.registerAgent(agent1.address, "DeFi-Agent-01");
    expect(await registry.isTrusted(agent1.address)).to.equal(true);
  });

  it("Should APPROVE a valid low-risk transaction", async function () {

    await registry.registerAgent(agent1.address, "DeFi-Agent-01");

    const value = ethers.parseEther("0.1");

    const [decision] =
      await guardrail.validateTransaction.staticCall(
        agent1.address,
        owner.address,
        value,
        "0x00000000"
      );

    expect(decision).to.equal(0); // APPROVED
  });

  it("Should BLOCK transaction from unregistered agent", async function () {

    const value = ethers.parseEther("0.1");

    const [decision, reason] =
      await guardrail.validateTransaction.staticCall(
        maliciousAddr.address,
        owner.address,
        value,
        "0x00000000"
      );

    expect(decision).to.equal(1); // BLOCKED
    expect(reason).to.include("not trusted");
  });

  it("Should BLOCK transaction to blacklisted address", async function () {

    await registry.registerAgent(agent1.address, "DeFi-Agent-01");
    await guardrail.addToBlacklist(maliciousAddr.address);

    const value = ethers.parseEther("0.1");

    const [decision, reason] =
      await guardrail.validateTransaction.staticCall(
        agent1.address,
        maliciousAddr.address,
        value,
        "0x00000000"
      );

    expect(decision).to.equal(1); // BLOCKED
    expect(reason).to.include("blacklisted");
  });

  it("Should BLOCK transaction exceeding max value", async function () {

    await registry.registerAgent(agent1.address, "DeFi-Agent-01");

    const value = ethers.parseEther("2"); // > 1 ETH limit

    const [decision, reason] =
      await guardrail.validateTransaction.staticCall(
        agent1.address,
        owner.address,
        value,
        "0x00000000"
      );

    expect(decision).to.equal(1); // BLOCKED
    expect(reason).to.include("exceeds maximum");
  });

  it("Should log audit events correctly", async function () {

    await audit.logEvent(
      0,
      agent1.address,
      owner.address,
      100,
      "Test approval",
      10
    );

    expect(await audit.getTotalEvents()).to.equal(1);
  });

});
