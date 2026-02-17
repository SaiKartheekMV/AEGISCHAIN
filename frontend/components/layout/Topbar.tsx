"use client"
import { useEffect, useState } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { healthApi } from "@/lib/api"

export default function Topbar({ title }: { title: string }) {
  const [online, setOnline] = useState<boolean | null>(null)

  useEffect(() => {
    healthApi.check()
      .then(() => setOnline(true))
      .catch(() => setOnline(false))
  }, [])

  return (
    <header className="h-14 border-b border-[#1e2d4a] bg-[#0f1629]/80 backdrop-blur flex items-center justify-between px-6">
      <h1 className="text-sm font-semibold text-slate-200">{title}</h1>
      <div className="flex items-center gap-4">
        {online === null ? null : online ? (
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <Wifi size={13} />
            <span>Backend Online</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-red-400">
            <WifiOff size={13} />
            <span>Backend Offline</span>
          </div>
        )}
        <div className="text-xs text-slate-500 font-mono">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </header>
  )
}
