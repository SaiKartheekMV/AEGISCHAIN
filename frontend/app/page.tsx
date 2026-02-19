'use client'

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Shield,
  Activity,
  Lock,
  Zap,
  AlertCircle,
  CheckCircle2,
  FileSearch,
  Sparkles,
  Layers,
} from "lucide-react"
import { useWallet } from "@/context/WalletContext"
import { WalletButton } from "@/components/WalletButton"
import { useEffect, useState } from "react"

const TRUSTED_PROTOCOLS = ["Uniswap", "Aave", "Compound", "Curve", "Balancer", "Lido"]

const FEATURE_CARDS = [
  {
    icon: Shield,
    title: "Policy-First Transaction Control",
    description:
      "Every action goes through deterministic policy checks before execution. AI assists, policy decides.",
    bullets: ["Value and exposure limits", "Target contract safety checks", "Agent trust-aware scoring"],
  },
  {
    icon: Sparkles,
    title: "Hallucination & Prompt Injection Defense",
    description:
      "Intent ambiguity, missing addresses, and risky instruction patterns are identified and escalated automatically.",
    bullets: ["Named-recipient ambiguity detection", "Intent/transaction mismatch checks", "Critical-risk escalation path"],
  },
  {
    icon: FileSearch,
    title: "Explainable Risk Decisions",
    description:
      "Each APPROVED, PENDING, or BLOCKED decision includes reason codes and AI-generated plain-English explanation.",
    bullets: ["Human-readable rationale", "Risk score transparency", "Decision-state consistency"],
  },
  {
    icon: Layers,
    title: "On-Chain + Off-Chain Guardrails",
    description:
      "Combines runtime backend controls with deployed smart-contract policy anchors for defense in depth.",
    bullets: ["Registry-backed trust context", "Audit-ready event model", "Progressive on-chain hardening path"],
  },
]

const PROCESS_STEPS = [
  {
    title: "Intent Capture",
    detail: "Natural-language or manual transaction intent enters a constrained transaction model.",
  },
  {
    title: "Risk & Policy Evaluation",
    detail: "Risk engine scores trust, value limits, target safety, function signatures, and intent consistency.",
  },
  {
    title: "Controlled Execution",
    detail: "Only approved transactions proceed. Pending and blocked actions return auditable reasons.",
  },
  {
    title: "Audit & Feedback Loop",
    detail: "Full event trails are persisted for compliance, analytics, and continuous policy improvement.",
  },
]

const USE_CASES = [
  {
    title: "DeFi Treasury Ops",
    detail: "Automate recurring liquidity and treasury actions with policy-based controls and daily exposure limits.",
  },
  {
    title: "Agentic Trading Workflows",
    detail: "Run strategy agents with enforced pre-trade checks, trust-aware scoring, and blocked-risk execution paths.",
  },
  {
    title: "Protocol Integrations",
    detail: "Allow only approved contract interactions and maintain explainable decision logs for every action.",
  },
]

const TRUST_ITEMS = [
  "Deterministic policy checks before execution",
  "Explainable APPROVED / PENDING / BLOCKED decisions",
  "Event-level audit logs for operations and compliance",
  "Hybrid architecture with smart-contract policy anchors",
]

const FAQS = [
  {
    q: "Does AI decide transactions by itself?",
    a: "AI helps parse intent and explain outcomes, but deterministic policy and risk thresholds control final execution decisions.",
  },
  {
    q: "Can vague intent like 'send money to Bob' pass?",
    a: "No. Ambiguous or hallucinated intent is flagged as critical risk and routed to block or manual review paths.",
  },
  {
    q: "How do teams audit behavior later?",
    a: "Every decision and related event is logged with context, risk score, and timestamp for clear forensic and compliance review.",
  },
  {
    q: "Is this ready only for demos?",
    a: "The current build is production-oriented in architecture, with a clear hardening roadmap for mandatory on-chain enforcement paths.",
  },
]

export default function LandingPage() {
  const { isConnected, connectWallet, isConnecting } = useWallet()
  const router = useRouter()
  const [showMetaMaskPrompt, setShowMetaMaskPrompt] = useState(false)

  useEffect(() => {
    if (!isConnected) {
      const timer = setTimeout(() => {
        if (!isConnected) setShowMetaMaskPrompt(true)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isConnected])

  const handleGetStarted = () => {
    if (isConnected) {
      router.push("/dashboard")
    } else {
      connectWallet()
    }
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-200 relative overflow-x-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(14,165,233,0.18),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(249,115,22,0.14),transparent_30%),radial-gradient(circle_at_50%_100%,rgba(34,197,94,0.1),transparent_30%)]" />

      {showMetaMaskPrompt && !isConnected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-sky-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-sky-500/10 flex items-center justify-center">
                <Shield className="text-sky-400" size={24} />
              </div>
              <h2 className="text-2xl font-bold text-white">Connect Wallet</h2>
            </div>

            <p className="text-slate-300 mb-6">
              Connect MetaMask to access AegisChain and start guarded transaction workflows.
            </p>

            <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-4 mb-6 flex gap-3">
              <AlertCircle className="text-sky-400 flex-shrink-0" size={20} />
              <p className="text-sm text-sky-200">Use Sepolia testnet for the live product demo path.</p>
            </div>

            <button
              onClick={() => {
                connectWallet()
                setShowMetaMaskPrompt(false)
              }}
              disabled={isConnecting}
              className="w-full px-6 py-3 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              {isConnecting ? "Connecting..." : "Connect MetaMask"}
            </button>

            <button
              onClick={() => setShowMetaMaskPrompt(false)}
              className="w-full px-6 py-3 rounded-xl border border-slate-700 text-slate-300 font-semibold hover:border-slate-500 hover:text-white transition-all"
            >
              Continue Exploring
            </button>

            <p className="text-xs text-slate-500 mt-4 text-center">
              Need wallet setup?{" "}
              <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300">
                Install MetaMask
              </a>
            </p>
          </div>
        </div>
      )}

      <header className="h-20 flex items-center justify-between px-6 lg:px-12 border-b border-white/5 backdrop-blur-md fixed top-0 w-full z-50 bg-[#070b14]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <Shield className="text-sky-400" size={20} />
          </div>
          <span className="text-xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            AegisChain
          </span>
        </div>

        <div className="flex items-center gap-3">
          <WalletButton />
          <Link
            href="/demo"
            className="px-5 py-2.5 rounded-lg bg-slate-800 text-white text-sm font-semibold hover:bg-slate-700 transition-all"
          >
            Demo
          </Link>
        </div>
      </header>

      <main className="pt-28 pb-20">
        <section className="px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                v1.0 Now Live on Sepolia
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Secure Your <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-blue-500 to-orange-500">
                  On-Chain Agents
                </span>
              </h1>

              <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
                The first AI-native guardrail system for autonomous DeFi operations.
                Prevent unauthorized transactions, halt hallucinations, and audit every action in real-time.
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleGetStarted}
                  disabled={isConnecting}
                  className="px-8 py-4 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 group"
                >
                  {isConnecting ? "Connecting..." : isConnected ? "Dashboard" : "Get Started"}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
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
              <div className="relative z-10 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Activity className="text-orange-500" size={24} />
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
                    { icon: Zap, title: "Execution Speed", status: "14ms", color: "text-orange-500", bg: "bg-orange-500/10" },
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

              <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 mt-14">
          <div className="max-w-7xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/50 p-5 lg:p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-4">Protocol Coverage</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {TRUSTED_PROTOCOLS.map((protocol) => (
                <div key={protocol} className="rounded-lg border border-slate-800 bg-[#0d1528] px-3 py-2 text-center text-sm text-slate-300">
                  {protocol}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl mb-10">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-300 mb-3">Why Teams Choose AegisChain</p>
              <h2 className="text-3xl lg:text-4xl font-semibold text-white leading-tight">
                Enterprise-grade guardrails for autonomous financial execution
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {FEATURE_CARDS.map((feature) => (
                <div key={feature.title} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
                  <feature.icon className="text-sky-300 mb-4" size={22} />
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                  <ul className="mt-4 space-y-1.5">
                    {feature.bullets.map((bullet) => (
                      <li key={bullet} className="text-xs text-slate-300 flex items-start gap-2">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-orange-300 shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 mt-20">
          <div className="max-w-7xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/40 p-6 lg:p-8">
            <div className="max-w-3xl mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300 mb-3">How It Works</p>
              <h2 className="text-3xl lg:text-4xl font-semibold text-white">From intent to controlled execution in four steps</h2>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PROCESS_STEPS.map((step, idx) => (
                <div key={step.title} className="rounded-xl border border-slate-800 bg-[#0d1528] p-4">
                  <p className="text-xs text-slate-500 mb-2">Step {idx + 1}</p>
                  <p className="text-sm font-semibold text-white mb-2">{step.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.detail}</p>
                  <p className="text-[11px] text-orange-200/80 mt-3">
                    Outcome: {idx === 0 ? "Structured input" : idx === 1 ? "Risk-scored decision" : idx === 2 ? "Controlled execution" : "Persistent evidence"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="max-w-3xl mb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-300 mb-3">Use Cases</p>
              <h2 className="text-3xl lg:text-4xl font-semibold text-white">Built for real autonomous transaction workflows</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {USE_CASES.map((useCase) => (
                <div key={useCase.title} className="rounded-xl border border-slate-800 bg-slate-900/45 p-5">
                  <p className="text-sm font-semibold text-white mb-2">{useCase.title}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{useCase.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 mt-20">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/45 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-sky-300 mb-3">Trust & Compliance</p>
              <h3 className="text-2xl font-semibold text-white mb-4">Security posture for B2B stakeholders</h3>
              <div className="space-y-3">
                {TRUST_ITEMS.map((item) => (
                  <div key={item} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-300 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/45 p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-300 mb-3">Architecture Summary</p>
              <h3 className="text-2xl font-semibold text-white mb-4">Control layers across the stack</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="rounded-lg border border-slate-800 bg-[#0d1528] p-3">
                  <p className="font-medium text-white mb-1">Frontend Control Surface</p>
                  <p className="text-xs text-slate-400">Intent input, operator visibility, and guarded execution UX.</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#0d1528] p-3">
                  <p className="font-medium text-white mb-1">Backend Guard Engine</p>
                  <p className="text-xs text-slate-400">Risk scoring, policy thresholds, and decision-state orchestration.</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-[#0d1528] p-3">
                  <p className="font-medium text-white mb-1">Contract Anchors</p>
                  <p className="text-xs text-slate-400">Registry, guardrail, and audit primitives for progressive hardening.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 mt-20">
          <div className="max-w-7xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/45 p-6 lg:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300 mb-3">Frequently Asked Questions</p>
            <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-8">Answers your security and product teams need</h2>

            <div className="grid md:grid-cols-2 gap-4">
              {FAQS.map((item) => (
                <div key={item.q} className="rounded-xl border border-slate-800 bg-[#0d1528] p-4">
                  <p className="text-sm font-semibold text-white mb-2">{item.q}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 mt-20">
          <div className="max-w-7xl mx-auto rounded-2xl border border-orange-500/30 bg-orange-500/10 p-6 lg:p-7">
            <div className="grid lg:grid-cols-2 gap-5 items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-orange-300 mb-3">Executive Summary</p>
                <p className="text-sm text-slate-200 leading-relaxed">
                  AegisChain gives teams a practical control plane for autonomous on-chain execution:
                  AI-assisted intent handling, deterministic risk policy, and full decision observability.
                </p>
              </div>
              <div className="flex sm:justify-end gap-3 flex-wrap">
                <button
                  onClick={handleGetStarted}
                  disabled={isConnecting}
                  className="px-6 py-3 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isConnected ? "Open Dashboard" : "Start Now"}
                  <ArrowRight size={16} />
                </button>
                <Link
                  href="/demo"
                  className="px-6 py-3 rounded-xl border border-orange-400/40 text-orange-200 font-semibold hover:border-orange-300 transition-all bg-orange-500/10"
                >
                  View Live Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 lg:px-12 mt-20">
          <div className="max-w-7xl mx-auto rounded-2xl border border-slate-800 bg-gradient-to-r from-sky-900/35 via-slate-900/60 to-orange-900/25 p-8 lg:p-10">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-sky-300 mb-3">Ready To Deploy</p>
                <h2 className="text-3xl lg:text-4xl font-semibold text-white leading-tight">
                  Secure AI transaction autonomy before it reaches production wallets
                </h2>
                <p className="text-sm text-slate-300 mt-4 max-w-xl">
                  Use policy-driven guardrails to stop unsafe actions early and give your security and product teams a shared control plane.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row lg:justify-end gap-3">
                <button
                  onClick={handleGetStarted}
                  disabled={isConnecting}
                  className="px-6 py-3 rounded-xl bg-sky-600 text-white font-semibold hover:bg-sky-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isConnected ? "Go to Dashboard" : "Connect & Start"}
                  <ArrowRight size={16} />
                </button>

                <Link
                  href="/demo"
                  className="px-6 py-3 rounded-xl border border-slate-700 text-slate-200 font-semibold hover:border-slate-500 transition-all bg-slate-900/50 text-center"
                >
                  Explore Demo Flow
                </Link>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-300" />Risk-based approvals</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-300" />Hallucination checks</span>
              <span className="inline-flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-300" />Audit-ready event trail</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>2026 AegisChain Security. AI Agent Transaction Guardrails.</p>
      </footer>
    </div>
  )
}
