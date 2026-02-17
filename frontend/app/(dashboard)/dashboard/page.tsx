"use client"
import { useEffect, useState, useCallback } from "react"
import {
  ShieldCheck, ShieldOff, Activity,
  TrendingUp, BarChart3, Clock
} from "lucide-react"
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts"
import Topbar from "@/components/layout/Topbar"
import StatCard from "@/components/ui/StatCard"
import RiskBadge from "@/components/ui/RiskBadge"
import DecisionBadge from "@/components/ui/DecisionBadge"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { transactionApi } from "@/lib/api"
import { Stats, Transaction } from "@/types"

const PIE_COLORS = ["#10b981", "#ef4444", "#f59e0b"]

export default function Dashboard() {
  const [stats, setStats]   = useState<Stats | null>(null)
  const [txs, setTxs]       = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [s, t] = await Promise.all([
        transactionApi.getStats(),
        transactionApi.getHistory(20),
      ])
      setStats(s)
      setTxs(t)
    } catch {}
    finally { setLoading(false) }
  }, [])

  useEffect(() => { load(); const id = setInterval(load, 10000); return () => clearInterval(id) }, [load])

  const pieData = stats ? [
    { name: "Approved", value: stats.approved },
    { name: "Blocked",  value: stats.blocked  },
    { name: "Pending",  value: stats.pending  },
  ] : []

  const areaData = txs.slice().reverse().map((t, i) => ({
    name: i,
    score: t.risk_score,
    blocked: t.decision === "BLOCKED" ? t.risk_score : 0,
  }))

  const blockRate = stats && stats.total > 0
    ? ((stats.blocked / stats.total) * 100).toFixed(1)
    : "0.0"

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Topbar title="Dashboard" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size={32} />
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4">
              <StatCard label="Total Transactions" value={stats?.total ?? 0}    icon={Activity}    color="blue"   />
              <StatCard label="Approved"           value={stats?.approved ?? 0} icon={ShieldCheck} color="green"  />
              <StatCard label="Blocked"            value={stats?.blocked ?? 0}  icon={ShieldOff}   color="red"    />
              <StatCard label="Block Rate"         value={`${blockRate}%`}      icon={TrendingUp}  color="yellow" sub="of all transactions" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-3 gap-4">

              {/* Area Chart */}
              <div className="col-span-2 bg-[#0f1629]/60 backdrop-blur-md border border-[#1e2d4a] rounded-xl p-5 hover:border-blue-500/20 transition-colors">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BarChart3 size={13} /> Risk Score Timeline
                </p>
                {areaData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <AreaChart data={areaData}>
                      <defs>
                        <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}   />
                        </linearGradient>
                        <linearGradient id="gb" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" hide />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#64748b" }} />
                      <Tooltip
                        contentStyle={{ background: "#0f1629", border: "1px solid #1e2d4a", borderRadius: 8, fontSize: 12 }}
                        labelStyle={{ color: "#94a3b8" }}
                      />
                      <Area type="monotone" dataKey="score"   stroke="#0ea5e9" fill="url(#gs)" strokeWidth={2} name="Risk Score" />
                      <Area type="monotone" dataKey="blocked" stroke="#ef4444" fill="url(#gb)" strokeWidth={2} name="Blocked Score" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[180px] flex items-center justify-center text-slate-600 text-sm">
                    No data yet — run a transaction
                  </div>
                )}
              </div>

              {/* Pie Chart */}
              <div className="bg-[#0f1629]/60 backdrop-blur-md border border-[#1e2d4a] rounded-xl p-5 hover:border-blue-500/20 transition-colors">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Decision Split</p>
                {pieData.some(d => d.value > 0) ? (
                  <>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={68} paddingAngle={3} dataKey="value">
                          {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: "#0f1629", border: "1px solid #1e2d4a", borderRadius: 8, fontSize: 12 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="space-y-1.5 mt-2">
                      {pieData.map((d, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                            <span className="text-slate-400">{d.name}</span>
                          </div>
                          <span className="text-slate-200 font-medium">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="h-[150px] flex items-center justify-center text-slate-600 text-sm">No data</div>
                )}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-[#0f1629]/60 backdrop-blur-md border border-[#1e2d4a] rounded-xl p-5 hover:border-blue-500/20 transition-colors">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Clock size={13} /> Recent Transactions
              </p>
              {txs.length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-sm">No transactions yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-slate-500 border-b border-[#1e2d4a]">
                        {["TX ID", "Agent", "Target", "Value", "Risk", "Decision", "Time"].map(h => (
                          <th key={h} className="pb-2 text-left font-medium pr-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1e2d4a]">
                      {txs.slice(0, 8).map(tx => (
                        <tr key={tx.tx_id} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-2.5 pr-4 font-mono text-slate-400">{tx.tx_id.slice(0, 12)}...</td>
                          <td className="py-2.5 pr-4 font-mono text-slate-300">{tx.agent_address.slice(0, 10)}...</td>
                          <td className="py-2.5 pr-4 font-mono text-slate-300">{tx.target_address.slice(0, 10)}...</td>
                          <td className="py-2.5 pr-4 text-slate-300">{tx.value_eth} ETH</td>
                          <td className="py-2.5 pr-4"><RiskBadge level={tx.risk_level} /></td>
                          <td className="py-2.5 pr-4"><DecisionBadge decision={tx.decision} /></td>
                          <td className="py-2.5 text-slate-500">{new Date(tx.timestamp).toLocaleTimeString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
