// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AgentRegistry is Ownable {

    enum AgentStatus { UNKNOWN, TRUSTED, SUSPENDED, BANNED }

    struct Agent {
        address agentAddress;
        string name;
        AgentStatus status;
        uint256 trustScore;     
        uint256 registeredAt;
        uint256 txCount;
        uint256 blockedCount;
    }

    mapping(address => Agent) public agents;
    address[] public agentList;

    // GuardRail contract address
    address public guardRail;

    /* ========== MODIFIERS ========== */

    modifier onlyGuardRail() {
        require(msg.sender == guardRail, "Only GuardRail allowed");
        _;
    }

    /* ========== EVENTS ========== */

    event AgentRegistered(address indexed agent, string name);
    event AgentStatusUpdated(address indexed agent, AgentStatus status);
    event TrustScoreUpdated(address indexed agent, uint256 newScore);
    event GuardRailUpdated(address indexed guardRail);

    constructor() Ownable(msg.sender) {}

    /* ========== ADMIN FUNCTIONS ========== */

    function setGuardRail(address _guardRail) external onlyOwner {
        require(_guardRail != address(0), "Invalid address");
        guardRail = _guardRail;
        emit GuardRailUpdated(_guardRail);
    }

    function registerAgent(address _agent, string calldata _name)
        external
        onlyOwner
    {
        require(_agent != address(0), "Invalid address");
        require(agents[_agent].registeredAt == 0, "Agent already registered");

        agents[_agent] = Agent({
            agentAddress: _agent,
            name: _name,
            status: AgentStatus.TRUSTED,
            trustScore: 100,
            registeredAt: block.timestamp,
            txCount: 0,
            blockedCount: 0
        });

        agentList.push(_agent);

        emit AgentRegistered(_agent, _name);
    }

    function updateStatus(address _agent, AgentStatus _status)
        external
        onlyOwner
    {
        require(isAgentRegistered(_agent), "Agent not found");
        agents[_agent].status = _status;
        emit AgentStatusUpdated(_agent, _status);
    }

    function updateTrustScore(address _agent, uint256 _score)
        external
        onlyOwner
    {
        require(isAgentRegistered(_agent), "Agent not found");
        require(_score <= 100, "Score must be 0-100");

        agents[_agent].trustScore = _score;

        emit TrustScoreUpdated(_agent, _score);
    }

    /* ========== GUARDRAIL FUNCTIONS ========== */

    function incrementTxCount(address _agent, bool _blocked)
        external
        onlyGuardRail
    {
        require(isAgentRegistered(_agent), "Agent not found");

        agents[_agent].txCount += 1;

        if (_blocked) {
            agents[_agent].blockedCount += 1;
        }
    }

    /* ========== VIEW FUNCTIONS ========== */

    function isAgentRegistered(address _agent)
        public
        view
        returns (bool)
    {
        return agents[_agent].registeredAt != 0;
    }

    function isTrusted(address _agent)
        external
        view
        returns (bool)
    {
        return agents[_agent].status == AgentStatus.TRUSTED;
    }

    function getAgent(address _agent)
        external
        view
        returns (Agent memory)
    {
        return agents[_agent];
    }

    function getAllAgents()
        external
        view
        returns (address[] memory)
    {
        return agentList;
    }
}
