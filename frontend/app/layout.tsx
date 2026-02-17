import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AegisChain — GuardRail System",
  description: "AI Agent Transaction Guardrails for Autonomous On-Chain Agents",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#0a0e1a] text-slate-200 overflow-hidden`}>
        {children}
      </body>
    </html>
  )
}
