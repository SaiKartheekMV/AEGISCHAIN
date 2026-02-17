"use client"
import { useEffect, useState, useCallback } from "react"
import { RefreshCw, Filter } from "lucide-react"
import Topbar from "@/components/layout/Topbar"
import RiskBadge from "@/components/ui/RiskBadge"
import DecisionBadge from "@/components/ui/DecisionBadge"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import EmptyState from "@/components/ui/EmptyState"
import { transactionApi } from "@/lib/api"
import { Transaction, TxDecision } from "@/types"
import { ArrowLeftRight } from "lucide-react"

export default function TransactionsPage() {
  const [txs, setTxs]       = useState<Transaction[]>([])
  const [filter, setFilter] = useState<TxDecision | "ALL">("ALL")
  const [selected, setSelected] = useState<Transaction | null>(null)
  const [loading, setLoading]   = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await transactionApi.getHistory(100)
      setTxs(data)
    } catch {} finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const filtered = filter === "ALL" ? txs : txs.filter(t => t.decision === filter)

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Transactions" />
      <div className="flex-1 overflow-y-auto p-6">

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <Filter size={14} className="text-slate-500" />
          {(["ALL", "APPROVED", "BLOCKED", "PENDING"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === f
                  ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                  : "bg-slate-800 text-slate-400 hover:text-slate-200 border border-transparent"
              }`}
            >{f}</button>
          ))}
          <button onClick={load} className="ml-auto p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200">
            <RefreshCw size={14} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64"><LoadingSpinner size={32} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon={ArrowLeftRight} title="No transactions" description="Validate a transaction to see it here" />
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {filtered.map(tx => (
              <div
                key={tx.tx_id}
                onClick={() => setSelected(selected?.tx_id === tx.tx_id ? null : tx)}
                className={`bg-[#0f1629]/60 backdrop-blur-md border rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-lg hover:border-sky-500/30 ${
                  selected?.tx_id === tx.tx_id ? "border-sky-500/40 glow-blue" : "border-[#1e2d4a]"
                }`}
              >
                {/* Row */}
                <div className="flex items-center gap-4 text-xs">
                  <span className="font-mono text-slate-400 w-28 shrink-0">{tx.tx_id.slice(0, 14)}...</span>
                  <span className="font-mono text-slate-300 w-28 shrink-0">{tx.agent_address.slice(0, 12)}...</span>
                  <span className="font-mono text-slate-300 w-28 shrink-0">{tx.target_address.slice(0, 12)}...</span>
                  <span className="text-slate-300 w-16">{tx.value_eth} ETH</span>
                  <div className="w-20"><RiskBadge level={tx.risk_level} /></div>
                  <div className="w-20"><DecisionBadge decision={tx.decision} /></div>
                  <span className="text-slate-500 ml-auto">{new Date(tx.timestamp).toLocaleTimeString()}</span>
                </div>

                {/* Expanded Detail */}
                {selected?.tx_id === tx.tx_id && (
                  <div className="mt-4 pt-4 border-t border-[#1e2d4a] space-y-3 slide-in">

                    {/* Risk Score Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Risk Score</span>
                        <span className="font-bold text-slate-200">{tx.risk_score}/100</span>
                      </div>
                      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            tx.risk_score >= 75 ? "bg-red-500" :
                            tx.risk_score >= 50 ? "bg-orange-500" :
                            tx.risk_score >= 25 ? "bg-amber-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${tx.risk_score}%` }}
                        />
                      </div>
                    </div>

                    {/* AI Explanation */}
                    <div className="bg-sky-500/5 border border-sky-500/20 rounded-lg p-3">
                      <p className="text-xs text-sky-400 font-medium mb-1">🤖 AI Explanation</p>
                      <p className="text-xs text-slate-300">{tx.ai_explanation}</p>
                    </div>

                    {/* Block Reason */}
                    {tx.block_reason && (
                      <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
                        <p className="text-xs text-red-400 font-medium mb-1">🚨 Block Reason</p>
                        <p className="text-xs text-slate-300">{tx.block_reason}</p>
                      </div>
                    )}

                    {/* Checks */}
                    <div className="grid grid-cols-2 gap-3">
                      {tx.checks_passed && tx.checks_passed.length > 0 && (
                        <div>
                          <p className="text-xs text-emerald-400 font-medium mb-2">✅ Passed</p>
                          <div className="space-y-1">
                            {tx.checks_passed.map((c, i) => (
                              <p key={i} className="text-xs text-slate-400 bg-slate-800/50 rounded px-2 py-1">{c}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      {tx.checks_failed && tx.checks_failed.length > 0 && (
                        <div>
                          <p className="text-xs text-red-400 font-medium mb-2">❌ Failed</p>
                          <div className="space-y-1">
                            {tx.checks_failed.map((c, i) => (
                              <p key={i} className="text-xs text-slate-400 bg-slate-800/50 rounded px-2 py-1">{c}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
