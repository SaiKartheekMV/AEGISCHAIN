import Link from "next/link"
import { ArrowRight, Shield, Activity, Lock, Zap } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="h-20 flex items-center justify-between px-6 lg:px-12 border-b border-white/5 backdrop-blur-sm fixed top-0 w-full z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Shield className="text-blue-400" size={20} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            AegisChain
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-lg bg-aegis-secondary text-white text-sm font-semibold hover:opacity-90 transition-all shadow-lg shadow-orange-500/20"
          >
            Launch App
          </Link>
        </div>
      </header>

      <main className="flex-1 pt-32 pb-20 px-6 lg:px-12">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              v1.0 Now Live on Sepolia
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Secure Your <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-aegis-secondary">
                On-Chain Agents
              </span>
            </h1>
            
            <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
              The first AI-native guardrail system for autonomous DeFi operations. 
              Prevent unauthorized transactions, halt hallucinations, and audit every action in real-time.
            </p>

            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all flex items-center gap-2 group"
              >
                Get Started
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/demo"
                className="px-8 py-4 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:border-slate-500 hover:text-white transition-all bg-slate-900/50"
              >
                View Live Demo
              </Link>
            </div>

            <div className="pt-8 flex items-center gap-8 text-slate-500 overflow-x-auto">
              {['Uniswap', 'Aave', 'Compound', 'Curve'].map((proto) => (
                <span key={proto} className="text-sm font-semibold uppercase tracking-widest">{proto}</span>
              ))}
            </div>
          </div>

          <div className="flex-1 w-full relative">
            {/* Abstract Visual */}
            <div className="relative z-10 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-aegis-secondary/10 flex items-center justify-center">
                    <Activity className="text-aegis-secondary" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white">Transaction Monitor</h3>
                    <p className="text-xs text-slate-400">Real-time analysis active</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20">
                  System Normal
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Lock, title: "Access Control", status: "Verified", color: "text-blue-400", bg: "bg-blue-500/10" },
                  { icon: Zap, title: "Execution Speed", status: "14ms", color: "text-aegis-secondary", bg: "bg-orange-500/10" },
                  { icon: Shield, title: "Risk Scoring", status: "Low Profile", color: "text-emerald-400", bg: "bg-emerald-500/10" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
                    <div className="flex items-center gap-4">
                      <item.icon className={item.color} size={20} />
                      <span className="text-slate-300 font-medium">{item.title}</span>
                    </div>
                    <span className={`text-xs font-mono px-2 py-1 rounded ${item.bg} ${item.color}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decoration */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-aegis-secondary/20 rounded-full blur-3xl -z-10" />
          </div>
        </div>
      </main>

      <footer className="py-8 border-t border-white/5 text-center text-slate-600 text-sm">
        <p>&copy; 2026 AegisChain Security. All rights reserved.</p>
      </footer>
    </div>
  )
}
