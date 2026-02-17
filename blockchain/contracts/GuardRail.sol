// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./AgentRegistry.sol";

contract GuardRail is Ownable, ReentrancyGuard {

    AgentRegistry public registry;

    uint256 public maxTxValueWei;
    uint256 public dailyLimitWei;
    uint256 public highValueThresholdWei;

    enum RiskLevel { LOW, MEDIUM, HIGH, CRITICAL }
    enum TxDecision { APPROVED, BLOCKED, PENDING_APPROVAL }

    struct GuardedTx {
        bytes32 txId;
        address agent;
        address target;
        uint256 value;
        bytes4 functionSig;
        RiskLevel risk;
        TxDecision decision;
        string blockReason;
        uint256 timestamp;
    }

    mapping(address => bool) public blacklist;
    mapping(address => bool) public whitelist;
    mapping(address => uint256) public dailySpent;
    mapping(address => uint256) public lastResetDay;

    mapping(bytes32 => GuardedTx) public guardedTxs;
    bytes32[] public txHistory;

    event TransactionApproved(
        bytes32 indexed txId,
        address indexed agent,
        address target,
        uint256 value
    );

    event TransactionBlocked(
        bytes32 indexed txId,
        address indexed agent,
        string reason,
        RiskLevel risk
    );

    constructor(
        address _registry,
        uint256 _maxTxValueEth,
        uint256 _dailyLimitEth,
        uint256 _highValueThresholdEth
    ) Ownable(msg.sender) {
        registry = AgentRegistry(_registry);

        maxTxValueWei = _maxTxValueEth * 1e18;
        dailyLimitWei = _dailyLimitEth * 1e18;
        highValueThresholdWei = _highValueThresholdEth * 1e18;
    }

    /* ========== ADMIN FUNCTIONS ========== */

    function addToBlacklist(address _addr) external onlyOwner {
        blacklist[_addr] = true;
    }

    function removeFromBlacklist(address _addr) external onlyOwner {
        blacklist[_addr] = false;
    }

    function addToWhitelist(address _addr) external onlyOwner {
        whitelist[_addr] = true;
    }

    function removeFromWhitelist(address _addr) external onlyOwner {
        whitelist[_addr] = false;
    }

    /* ========== MAIN VALIDATION ========== */

    function validateTransaction(
        address _agent,
        address _target,
        uint256 _value,
        bytes4 _functionSig
    )
        external
        returns (TxDecision, string memory)
    {
        bytes32 txId = keccak256(
            abi.encodePacked(
                _agent,
                _target,
                _value,
                _functionSig,
                block.timestamp
            )
        );

        RiskLevel risk = RiskLevel.LOW;

        // 1️⃣ Agent must be trusted
        if (!registry.isTrusted(_agent)) {
            return _blockTx(
                txId,
                _agent,
                _target,
                _value,
                _functionSig,
                RiskLevel.CRITICAL,
                "Agent not trusted or suspended"
            );
        }

        // 2️⃣ Target blacklisted
        if (blacklist[_target]) {
            return _blockTx(
                txId,
                _agent,
                _target,
                _value,
                _functionSig,
                RiskLevel.CRITICAL,
                "Target blacklisted"
            );
        }

        // 3️⃣ Max value check (FIXED VARIABLE NAME)
        if (_value > maxTxValueWei) {
            return _blockTx(
                txId,
                _agent,
                _target,
                _value,
                _functionSig,
                RiskLevel.HIGH,
                "Value exceeds maximum allowed"
            );
        }

        // ✅ APPROVED
        registry.incrementTxCount(_agent, false);

        _recordTx(
            txId,
            _agent,
            _target,
            _value,
            _functionSig,
            risk,
            TxDecision.APPROVED,
            "Approved"
        );

        emit TransactionApproved(
            txId,
            _agent,
            _target,
            _value
        );

        return (TxDecision.APPROVED, "Approved");
    }

    /* ========== INTERNAL BLOCK ========== */

    function _blockTx(
        bytes32 txId,
        address _agent,
        address _target,
        uint256 _value,
        bytes4 _functionSig,
        RiskLevel _risk,
        string memory _reason
    )
        internal
        returns (TxDecision, string memory)
    {
        // Only increment if agent is trusted (prevents revert)
        if (registry.isTrusted(_agent)) {
            registry.incrementTxCount(_agent, true);
        }

        _recordTx(
            txId,
            _agent,
            _target,
            _value,
            _functionSig,
            _risk,
            TxDecision.BLOCKED,
            _reason
        );

        emit TransactionBlocked(
            txId,
            _agent,
            _reason,
            _risk
        );

        return (TxDecision.BLOCKED, _reason);
    }

    /* ========== INTERNAL HELPERS ========== */

    function _recordTx(
        bytes32 txId,
        address _agent,
        address _target,
        uint256 _value,
        bytes4 _functionSig,
        RiskLevel _risk,
        TxDecision _decision,
        string memory _reason
    ) internal {
        guardedTxs[txId] = GuardedTx({
            txId: txId,
            agent: _agent,
            target: _target,
            value: _value,
            functionSig: _functionSig,
            risk: _risk,
            decision: _decision,
            blockReason: _reason,
            timestamp: block.timestamp
        });

        txHistory.push(txId);
    }

    function _resetDailyIfNeeded(address _agent) internal {
        uint256 today = block.timestamp / 1 days;

        if (lastResetDay[_agent] < today) {
            dailySpent[_agent] = 0;
            lastResetDay[_agent] = today;
        }
    }
}
