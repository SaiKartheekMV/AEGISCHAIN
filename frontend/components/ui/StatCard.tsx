import { LucideIcon } from "lucide-react"

interface Props {
  label: string
  value: number | string
  icon: LucideIcon
  color: "blue" | "green" | "red" | "yellow"
  sub?: string
}

const colors = {
  blue:   { icon: "text-sky-400",     border: "border-sky-500/20",     bg: "bg-sky-500/5"     },
  green:  { icon: "text-emerald-400", border: "border-emerald-500/20", bg: "bg-emerald-500/5" },
  red:    { icon: "text-red-400",     border: "border-red-500/20",     bg: "bg-red-500/5"     },
  yellow: { icon: "text-amber-400",   border: "border-amber-500/20",   bg: "bg-amber-500/5"   },
}

export default function StatCard({ label, value, icon: Icon, color, sub }: Props) {
  const c = colors[color]
  return (
    <div className={`rounded-xl border p-5 ${c.border} ${c.bg} backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/20 group`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</span>
        <Icon size={16} className={c.icon} />
      </div>
      <div className="text-3xl font-bold text-slate-100">{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  )
}
