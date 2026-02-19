'use client'

import { useState } from 'react'
import Topbar from '@/components/layout/Topbar'
import SendTransactionForm from '@/components/SendTransactionForm'
import NetworkBalanceInfo from '@/components/NetworkBalanceInfo'
import { AlertCircle, Info } from 'lucide-react'

export default function SendPage() {
  const [activeTab, setActiveTab] = useState<'send' | 'info'>('send')

  return (
    <div className="flex flex-col h-full">
      <Topbar title="Send Transaction" />
      
      <div className="flex-1 overflow-y-auto p-6">
        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 border-b border-[#1e2d4a]">
          <button
            onClick={() => setActiveTab('send')}
            className={`px-4 py-3 font-medium text-sm transition-all border-b-2 ${
              activeTab === 'send'
                ? 'text-sky-400 border-sky-500/50'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            Send ETH
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-3 font-medium text-sm transition-all border-b-2 ${
              activeTab === 'info'
                ? 'text-sky-400 border-sky-500/50'
                : 'text-slate-400 border-transparent hover:text-slate-300'
            }`}
          >
            How It Works
          </button>
        </div>

        {/* Send Tab */}
        {activeTab === 'send' && (
          <div className="max-w-2xl">
            {/* Network & Balance Info */}
            <div className="mb-6">
              <NetworkBalanceInfo />
            </div>

            <div className="bg-[#0f1629]/60 backdrop-blur-md border border-[#1e2d4a] rounded-xl p-6 mb-6">
              <SendTransactionForm />
            </div>

            {/* Security Info */}
            <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-4 flex gap-3">
              <Info size={18} className="text-sky-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-slate-300">
                <p className="font-medium text-sky-400 mb-1">🔒 Secure Transaction Flow</p>
                <ul className="space-y-1 text-xs text-slate-400">
                  <li>✓ All transactions are analyzed by Guard AI before broadcasting</li>
                  <li>✓ Risk assessment uses smart contracts and threat database</li>
                  <li>✓ Blacklist/whitelist protections applied automatically</li>
                  <li>✓ Full audit trail recorded on blockchain</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Info Tab */}
        {activeTab === 'info' && (
          <div className="max-w-2xl space-y-4">
            {/* Step 1 */}
            <div className="bg-[#0f1629]/60 backdrop-blur-md border border-[#1e2d4a] rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-sky-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-slate-200 mb-2">Connect MetaMask</h3>
                  <p className="text-sm text-slate-400">
                    Click the &quot;Connect Wallet&quot; button in the top-right corner to connect your MetaMask account. Make sure you&apos;re on the Sepolia testnet.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-[#0f1629]/60 backdrop-blur-md border border-[#1e2d4a] rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-sky-400 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-slate-200 mb-2">Fill Transaction Details</h3>
                  <p className="text-sm text-slate-400">
                    Enter the recipient&apos;s Ethereum address and the amount in ETH you want to send. Optionally, add an intent description to help Guard AI better understand the transaction.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-[#0f1629]/60 backdrop-blur-md border border-[#1e2d4a] rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-sky-400 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-slate-200 mb-2"> Guard Analysis</h3>
                  <p className="text-sm text-slate-400">
                    The backend analyzes your transaction using AI and guardrails. It calculates risk scores, checks against blacklists, and evaluates agent trust.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-[#0f1629]/60 backdrop-blur-md border border-[#1e2d4a] rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-500/50 flex items-center justify-center flex-shrink-0">
                  <span className="text-sky-400 font-bold text-sm">4</span>
                </div>
                <div>
                  <h3 className="font-medium text-slate-200 mb-2">⛓️ Blockchain Execution</h3>
                  <p className="text-sm text-slate-400">
                    If approved, MetaMask will prompt you to sign and broadcast the transaction. Once confirmed, it will be recorded in your transaction history.
                  </p>
                </div>
              </div>
            </div>

            {/* Decision Logic */}
            <div className="bg-[#0f1629]/60 backdrop-blur-md border border-[#1e2d4a] rounded-xl p-6">
              <h3 className="font-medium text-slate-200 mb-4">Decision Logic</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded text-xs font-medium flex-shrink-0 mt-0.5">APPROVED</span>
                  <p className="text-slate-400">Transaction is safe and will be automatically sent to MetaMask</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-amber-500/20 text-amber-400 px-2.5 py-1 rounded text-xs font-medium flex-shrink-0 mt-0.5">PENDING</span>
                  <p className="text-slate-400">High risk + high value requires manual approval from administrators</p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-red-500/20 text-red-400 px-2.5 py-1 rounded text-xs font-medium flex-shrink-0 mt-0.5">BLOCKED</span>
                  <p className="text-slate-400">Transaction failed security checks (blacklist, high risk, etc.)</p>
                </div>
              </div>
            </div>

            {/* Risk Factors */}
            <div className="bg-[#0f1629]/60 backdrop-blur-md border border-[#1e2d4a] rounded-xl p-6">
              <h3 className="font-medium text-slate-200 mb-4">Risk Factors Analyzed</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                  Agent trust score history
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                  Daily spending limits
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                  Recipient address reputation
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                  Transaction value anomalies
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-sky-500 rounded-full"></span>
                  Known exploit patterns
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
