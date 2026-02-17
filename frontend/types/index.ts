export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
export type TxDecision = "APPROVED" | "BLOCKED" | "PENDING"

export interface Transaction {
  tx_id: string
  agent_address: string
  target_address: string
  value_eth: number
  function_sig?: string
  risk_level: RiskLevel
  risk_score: number
  decision: TxDecision
  block_reason?: string
  ai_explanation: string
  checks_passed?: string[]
  checks_failed?: string[]
  timestamp: string
}

export interface Agent {
  address: string
  name: string
  trust_score: number
  is_active: boolean
  tx_count: number
  blocked_count: number
  registered_at: string
}

export interface Stats {
  total: number
  approved: number
  blocked: number
  pending: number
}

export interface AuditLog {
  id: number
  event_type: string
  agent_address: string
  target_address?: string
  value_eth?: number
  description: string
  risk_score: number
  timestamp: string
}

export interface ValidateTxRequest {
  agent_address: string
  target_address: string
  value_eth: number
  function_sig?: string
  intent?: string
  protocol?: string
}
