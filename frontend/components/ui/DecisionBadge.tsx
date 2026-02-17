import { TxDecision } from "@/types"
import { CheckCircle, XCircle, Clock } from "lucide-react"

const config = {
  APPROVED: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/30", Icon: CheckCircle },
  BLOCKED:  { bg: "bg-red-500/10",     text: "text-red-400",     border: "border-red-500/30",     Icon: XCircle      },
  PENDING:  { bg: "bg-amber-500/10",   text: "text-amber-400",   border: "border-amber-500/30",   Icon: Clock        },
}

export default function DecisionBadge({ decision }: { decision: TxDecision }) {
  const c = config[decision] || config.PENDING
  const Icon = c.Icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
      <Icon size={11} />
      {decision}
    </span>
  )
}
