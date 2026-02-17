// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AuditTrail is Ownable {

    enum EventType { TX_APPROVED, TX_BLOCKED, AGENT_REGISTERED, THREAT_DETECTED, MANUAL_OVERRIDE }

    struct AuditEvent {
        uint256 id;
        EventType eventType;
        address agent;
        address target;
        uint256 value;
        string description;
        uint8 riskScore;        // 0-100
        uint256 timestamp;
    }

    AuditEvent[] public auditLog;
    uint256 public eventCount;

    // Quick lookup: agent → their event IDs
    mapping(address => uint256[]) public agentEvents;

    event AuditEventLogged(uint256 indexed id, EventType eventType, address indexed agent, uint8 riskScore);

    constructor() Ownable(msg.sender) {}

    function logEvent(
        EventType _type,
        address _agent,
        address _target,
        uint256 _value,
        string calldata _description,
        uint8 _riskScore
    ) external onlyOwner {
        uint256 id = eventCount++;
        auditLog.push(AuditEvent({
            id: id,
            eventType: _type,
            agent: _agent,
            target: _target,
            value: _value,
            description: _description,
            riskScore: _riskScore,
            timestamp: block.timestamp
        }));
        agentEvents[_agent].push(id);
        emit AuditEventLogged(id, _type, _agent, _riskScore);
    }

    function getEvent(uint256 _id) external view returns (AuditEvent memory) {
        return auditLog[_id];
    }

    function getAgentEvents(address _agent) external view returns (uint256[] memory) {
        return agentEvents[_agent];
    }

    function getTotalEvents() external view returns (uint256) {
        return auditLog.length;
    }

    function getRecentEvents(uint256 _count) external view returns (AuditEvent[] memory) {
        uint256 total = auditLog.length;
        uint256 count = _count > total ? total : _count;
        AuditEvent[] memory recent = new AuditEvent[](count);
        for (uint256 i = 0; i < count; i++) {
            recent[i] = auditLog[total - count + i];
        }
        return recent;
    }
}