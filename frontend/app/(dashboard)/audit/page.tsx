"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { ScrollText, RefreshCw, Search } from "lucide-react"
import Topbar from "@/components/layout/Topbar"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import EmptyState from "@/components/ui/EmptyState"
import { auditApi } from "@/lib/api"
import { AuditLog } from "@/types"

const eventConfig: Record<string, { bg: string; text: string; label: string }> = {
  TX_APPROVED: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "OK" },
  TX_BLOCKED: { bg: "bg-red-500/10", text: "text-red-400", label: "BLK" },
  TX_BROADCAST: { bg: "bg-cyan-500/10", text: "text-cyan-400", label: "TX" },
  AGENT_REGISTERED: { bg: "bg-sky-500/10", text: "text-sky-400", label: "REG" },
  AGENT_AUTO_REGISTERED: { bg: "bg-sky-500/10", text: "text-sky-400", label: "AUTO" },
  THREAT_DETECTED: { bg: "bg-orange-500/10", text: "text-orange-400", label: "RISK" },
  MANUAL_OVERRIDE: { bg: "bg-purple-500/10", text: "text-purple-400", label: "OVR" },
  BLACKLIST_ADDED: { bg: "bg-red-500/10", text: "text-red-400", label: "DENY" },
  WHITELIST_ADDED: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "ALLOW" },
}

function shortenAddress(value?: string, prefix = 8, suffix = 6) {
  if (!value) return "N/A"
  if (value.length <= prefix + suffix + 3) return value
  return `${value.slice(0, prefix)}...${value.slice(-suffix)}`
}

function getRiskBarClass(score: number) {
  if (score >= 75) return "bg-red-500"
  if (score >= 50) return "bg-orange-500"
  if (score >= 25) return "bg-amber-500"
  return "bg-emerald-500"
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [eventFilter, setEventFilter] = useState("ALL")

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setLogs(await auditApi.getLogs(100))
    } catch {
      setError("Failed to load audit logs from backend")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const eventOptions = useMemo(() => {
    return ["ALL", ...Array.from(new Set(logs.map((log) => log.event_type)))]
  }, [logs])

  const filteredLogs = useMemo(() => {
    const q = query.trim().toLowerCase()
    return logs.filter((log) => {
      if (eventFilter !== "ALL" && log.event_type !== eventFilter) return false
      if (!q) return true

      const haystack = [
        log.event_type,
        log.agent_address,
        log.target_address || "",
        log.description || "",
        String(log.risk_score),
      ]
        .join(" ")
        .toLowerCase()

      return haystack.includes(q)
    })
  }, [logs, query, eventFilter])

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Audit Logs" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {filteredLogs.length} shown / {logs.length} total audit events
            </p>
            <button onClick={load} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200">
              <RefreshCw size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative md:col-span-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by event, address, description, risk..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-[#0f1629] border border-[#1e2d4a] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500/50"
              />
            </div>

            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#0f1629] border border-[#1e2d4a] rounded-lg text-slate-200 focus:outline-none focus:border-sky-500/50"
            >
              {eventOptions.map((event) => (
                <option key={event} value={event}>
                  {event}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size={32} />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-sm text-red-300">{error}</div>
        ) : logs.length === 0 ? (
          <EmptyState icon={ScrollText} title="No audit logs yet" description="Events will appear here as transactions are processed" />
        ) : filteredLogs.length === 0 ? (
          <EmptyState icon={ScrollText} title="No matching logs" description="Try adjusting search text or event filter" />
        ) : (
          <div className="space-y-2">
            {filteredLogs.map((log) => {
              const cfg = eventConfig[log.event_type] || { bg: "bg-slate-800", text: "text-slate-400", label: "LOG" }
              const score = Math.min(100, Math.max(0, log.risk_score || 0))

              return (
                <div
                  key={log.id}
                  className="bg-[#0f1629]/60 backdrop-blur-md border border-[#1e2d4a] rounded-xl p-4 hover:border-slate-600 hover:bg-slate-800/40 transition-all duration-200"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-semibold tracking-wide w-10 text-slate-400">{cfg.label}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} border-current/20`}>
                        {log.event_type}
                      </span>
                      <span className="text-xs text-slate-500 ml-auto">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 text-xs">
                      <div className="bg-slate-900/60 rounded-md p-2">
                        <p className="text-slate-500 mb-1">Agent</p>
                        <p className="text-slate-300 font-mono">{shortenAddress(log.agent_address)}</p>
                      </div>
                      <div className="bg-slate-900/60 rounded-md p-2">
                        <p className="text-slate-500 mb-1">Target</p>
                        <p className="text-slate-300 font-mono">{shortenAddress(log.target_address)}</p>
                      </div>
                      <div className="bg-slate-900/60 rounded-md p-2">
                        <p className="text-slate-500 mb-1">Value</p>
                        <p className="text-slate-300">{log.value_eth ?? 0} ETH</p>
                      </div>
                      <div className="bg-slate-900/60 rounded-md p-2">
                        <p className="text-slate-500 mb-1">Risk Score</p>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${getRiskBarClass(score)}`} style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-slate-300">{score}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 bg-slate-900/40 rounded-md p-2">{log.description}</div>
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
