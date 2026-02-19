"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Bot, ArrowLeftRight,
  ScrollText, FlaskConical, Shield, Send
} from "lucide-react"

const nav = [
  { href: "/dashboard",    label: "Dashboard",    icon: LayoutDashboard },
  { href: "/send",         label: "Send",         icon: Send             },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight   },
  { href: "/agents",       label: "Agents",       icon: Bot              },
  { href: "/audit",        label: "Audit Logs",   icon: ScrollText       },
  { href: "/demo",         label: "POC Demo",     icon: FlaskConical     },
]

export default function Sidebar() {
  const path = usePathname()
  return (
    <aside className="w-64 h-full bg-[#0f1629] border-r border-[#1e2d4a] flex flex-col shrink-0 z-50">

      {/* Logo */}
      <div className="p-5 border-b border-[#1e2d4a]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Shield size={16} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100">AegisChain</p>
            <p className="text-[10px] text-slate-500">GuardRail System</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path === href
          return (
            <Link
              key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#1e2d4a]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-slow" />
          <span className="text-xs text-slate-500">Sepolia Testnet</span>
        </div>
      </div>
    </aside>
  )
}
