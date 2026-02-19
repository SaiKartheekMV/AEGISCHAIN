import axios from "axios"
import { Transaction, Agent, Stats, AuditLog, ValidateTxRequest } from "@/types"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
})

export const transactionApi = {
  validate: async (data: ValidateTxRequest) => {
    const res = await api.post("/api/v1/transactions/validate", data)
    return res.data
  },
  getHistory: async (limit = 50): Promise<Transaction[]> => {
    const res = await api.get(`/api/v1/transactions/history?limit=${limit}`)
    return res.data
  },
  getStats: async (): Promise<Stats> => {
    const res = await api.get("/api/v1/transactions/stats")
    return res.data
  },
  blacklist: async (address: string) => {
    const res = await api.post(`/api/v1/transactions/blacklist/${address}`)
    return res.data
  },
  whitelist: async (address: string) => {
    const res = await api.post(`/api/v1/transactions/whitelist/${address}`)
    return res.data
  },
  notify: async (txId: string, txHash: string) => {
    const res = await api.post(`/api/v1/transactions/notify`, { tx_id: txId, tx_hash: txHash })
    return res.data
  },
}

export const agentApi = {
  register: async (address: string, name: string): Promise<Agent> => {
    const res = await api.post("/api/v1/agents/register", { address, name })
    return res.data
  },
  autoRegister: async (address: string): Promise<Agent> => {
    const res = await api.post(`/api/v1/agents/auto-register/${address}`)
    return res.data
  },
  getAll: async (): Promise<Agent[]> => {
    const res = await api.get("/api/v1/agents/")
    return res.data
  },
  getOne: async (address: string): Promise<Agent> => {
    const res = await api.get(`/api/v1/agents/${address}`)
    return res.data
  },
}

export const auditApi = {
  getLogs: async (limit = 100): Promise<AuditLog[]> => {
    const res = await api.get(`/api/v1/audit/logs?limit=${limit}`)
    return res.data
  },
}

export const healthApi = {
  check: async () => {
    const res = await api.get("/health")
    return res.data
  },
}

export interface ParseIntentRequest {
  intent: string
}

export interface ParseIntentResponse {
  to_address: string
  amount: number
  ai_confidence: number
  reasoning: string
  parsed_from: string
  transaction_type: string
  is_protocol_interaction: boolean
  protocol_name?: string | null
}

export const aiApi = {
  parseIntent: async (data: ParseIntentRequest): Promise<ParseIntentResponse> => {
    const res = await api.post("/api/v1/ai/parse-intent", data)
    return res.data
  },
}
