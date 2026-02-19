'use client'

import { useWallet } from '@/hooks/useWallet'
import { AlertCircle, CheckCircle, Info } from 'lucide-react'

export default function NetworkBalanceInfo() {
  const { isConnected, chainName, chainId, balance, isSepoliaTestnet } = useWallet()

  if (!isConnected) return null

  return (
    <div
      className={`rounded-lg p-4 border ${
        isSepoliaTestnet
          ? 'bg-orange-500/10 border-orange-500/30'
          : 'bg-red-500/10 border-red-500/30'
      }`}
    >
      <div className="flex items-start gap-3">
        {isSepoliaTestnet ? (
          <CheckCircle size={18} className="text-orange-400 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
        )}
        
        <div className="flex-1">
          <div className="grid grid-cols-3 gap-4">
            {/* Network */}
            <div>
              <p className="text-xs text-slate-400 mb-1">Network</p>
              <p className={`text-sm font-medium ${
                isSepoliaTestnet ? 'text-orange-400' : 'text-red-400'
              }`}>
                {chainName}
              </p>
              <p className="text-xs text-slate-500">{chainId ? `ID: ${chainId}` : 'Unknown'}</p>
            </div>

            {/* Balance */}
            <div>
              <p className="text-xs text-slate-400 mb-1">Balance</p>
              <p className="text-sm font-medium text-slate-200">{balance || '0'} ETH</p>
              <p className="text-xs text-slate-500">Available</p>
            </div>

            {/* Status */}
            <div>
              <p className="text-xs text-slate-400 mb-1">Status</p>
              <p className={`text-sm font-medium ${
                isSepoliaTestnet ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {isSepoliaTestnet ? '✓ Testnet' : '⚠️ Mainnet'}
              </p>
              <p className="text-xs text-slate-500">{isSepoliaTestnet ? 'Safe' : 'Real'}</p>
            </div>
          </div>

          {/* Warning/Info Message */}
          <div className={`mt-3 text-xs ${
            isSepoliaTestnet ? 'text-orange-300' : 'text-red-300'
          }`}>
            {isSepoliaTestnet ? (
              <p>ℹ️ You are connected to Sepolia Testnet. Test ETH has no real value.</p>
            ) : (
              <p>⚠️ You are connected to Ethereum Mainnet. Real funds will be used!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
