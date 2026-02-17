"use client"
import { useEffect, useState, useCallback } from "react"
import { ScrollText, RefreshCw } from "lucide-react"
import Topbar from "@/components/layout/Topbar"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import EmptyState from "@/components/ui/EmptyState"
import { auditApi } from "@/lib/api"
import { AuditLog } from "@/types"

const eventConfig: Record<string, { bg: string; text: string; emoji: string }> = {
  TX_APPROVED:       { bg: "bg-emerald-500/10", text: "text-emerald-400", emoji: "✅" },
  TX_BLOCKED:        { bg: "bg-red-500/10",     text: "text-red-400",     emoji: "🚨" },
  AGENT_REGISTERED:  { bg: "bg-sky-500/10",     text: "text-sky-400",     emoji: "🤖" },
  THREAT_DETECTED:   { bg: "bg-orange-500/10",  text: "text-orange-400",  emoji: "⚠️" },
  MANUAL_OVERRIDE:   { bg: "bg-purple-500/10",  text: "text-purple-400",  emoji: "🔑" },
  BLACKLIST_ADDED:   { bg: "bg-red-500/10",     text: "text-red-400",     emoji: "🚫" },
  WHITELIST_ADDED:   { bg: "bg-emerald-500/10", text: "text-emerald-400", emoji: "✔️" },
}

export default function AuditPage() {
  const [logs, setLogs]       = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try { setLogs(await auditApi.getLogs(100)) }
    catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Audit Logs" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-slate-500">{logs.length} audit events</p>
          <button onClick={load} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200">
            <RefreshCw size={14} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64"><LoadingSpinner size={32} /></div>
        ) : logs.length === 0 ? (
          <EmptyState icon={ScrollText} title="No audit logs yet" description="Events will appear here as transactions are processed" />
        ) : (
          <div className="space-y-2">
            {logs.map(log => {
              const cfg = eventConfig[log.event_type] || { bg: "bg-slate-800", text: "text-slate-400", emoji: "📋" }
              return (
                <div key={log.id} className="bg-[#0f1629]/60 backdrop-blur-md border border-[#1e2d4a] rounded-xl p-4 hover:border-slate-600 hover:bg-slate-800/40 transition-all duration-200">
                  <div className="flex items-center gap-4">
                    <span className="text-lg w-6">{cfg.emoji}</span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} border-current/20 shrink-0`}>
                      {log.event_type}
                    </span>
                    <span className="text-xs font-mono text-slate-400 shrink-0">{log.agent_address.slice(0, 14)}...</span>
                    <span className="text-xs text-slate-300 flex-1 truncate">{log.description}</span>

                    {/* Risk Score */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            log.risk_score >= 75 ? "bg-red-500" :
                            log.risk_score >= 50 ? "bg-orange-500" :
                            log.risk_score >= 25 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${log.risk_score}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-8">{log.risk_score}</span>
                    </div>

                    <span className="text-xs text-slate-500 shrink-0">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
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
