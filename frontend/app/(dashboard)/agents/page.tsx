"use client"
import { useEffect, useState, useCallback } from "react"
import { Bot, Plus, X } from "lucide-react"
import Topbar from "@/components/layout/Topbar"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import EmptyState from "@/components/ui/EmptyState"
import { agentApi } from "@/lib/api"
import { Agent } from "@/types"

export default function AgentsPage() {
  const [agents, setAgents]   = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]       = useState({ address: "", name: "" })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]     = useState("")

  const load = useCallback(async () => {
    try { setAgents(await agentApi.getAll()) }
    catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const register = async () => {
    if (!form.address || !form.name) { setError("Both fields required"); return }
    setSubmitting(true); setError("")
    try {
      await agentApi.register(form.address, form.name)
      setForm({ address: "", name: "" })
      setShowForm(false)
      await load()
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Registration failed")
    } finally { setSubmitting(false) }
  }

  const trustColor = (score: number) =>
    score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-red-400"

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Agents" />
      <div className="flex-1 overflow-y-auto p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-slate-500">{agents.length} registered agents</p>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 text-xs hover:bg-sky-500/25 transition-all"
          >
            {showForm ? <X size={13} /> : <Plus size={13} />}
            {showForm ? "Cancel" : "Register Agent"}
          </button>
        </div>

        {/* Register Form */}
        {showForm && (
          <div className="bg-[#0f1629] border border-sky-500/20 rounded-xl p-5 mb-5 slide-in">
            <p className="text-sm font-semibold text-slate-200 mb-4">Register New Agent</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Agent Address</label>
                <input
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  placeholder="0xAgentAddress..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block">Agent Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="DeFi-Agent-01"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50"
                />
              </div>
            </div>
            {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
            <button
              onClick={register}
              disabled={submitting}
              className="mt-3 px-4 py-2 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-medium hover:bg-sky-500/30 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <LoadingSpinner size={12} />}
              {submitting ? "Registering..." : "Register Agent"}
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64"><LoadingSpinner size={32} /></div>
        ) : agents.length === 0 ? (
          <EmptyState icon={Bot} title="No agents registered" description="Register your first AI agent above" />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {agents.map(agent => {
              const blockRate = agent.tx_count > 0
                ? ((agent.blocked_count / agent.tx_count) * 100).toFixed(0)
                : "0"
              return (
                <div key={agent.address} className="bg-[#0f1629] border border-[#1e2d4a] rounded-xl p-5 hover:border-sky-500/20 transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                        <Bot size={16} className="text-sky-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-200">{agent.name}</p>
                        <p className="text-xs font-mono text-slate-500">{agent.address.slice(0, 16)}...</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      agent.is_active
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-700 text-slate-400 border-slate-600"
                    }`}>
                      {agent.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Trust Score Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400">Trust Score</span>
                      <span className={`font-bold ${trustColor(agent.trust_score)}`}>{agent.trust_score}/100</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          agent.trust_score >= 80 ? "bg-emerald-400" :
                          agent.trust_score >= 50 ? "bg-amber-400" : "bg-red-400"
                        }`}
                        style={{ width: `${agent.trust_score}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Total TXs",    value: agent.tx_count      },
                      { label: "Blocked",       value: agent.blocked_count },
                      { label: "Block Rate",    value: `${blockRate}%`     },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-slate-800/50 rounded-lg py-2">
                        <p className="text-sm font-bold text-slate-200">{value}</p>
                        <p className="text-[10px] text-slate-500">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
