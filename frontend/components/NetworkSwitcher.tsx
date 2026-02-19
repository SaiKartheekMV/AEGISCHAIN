'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { useWallet } from '@/hooks/useWallet'

const AVAILABLE_TESTNETS = [
  { chainId: 11155111, name: 'Sepolia', color: 'from-orange-500 to-orange-600' },
  { chainId: 5, name: 'Goerli', color: 'from-purple-500 to-purple-600' },
]

export default function NetworkSwitcher() {
  const { isConnected, chainId, chainName, switchNetwork } = useWallet()
  const [isOpen, setIsOpen] = useState(false)
  const [isSwitching, setIsSwitching] = useState(false)

  if (!isConnected) return null

  const currentNetwork = AVAILABLE_TESTNETS.find(n => n.chainId === chainId)

  const handleSwitchNetwork = async (newChainId: number) => {
    if (newChainId === chainId) {
      setIsOpen(false)
      return
    }

    try {
      setIsSwitching(true)
      await switchNetwork(newChainId)
      setIsOpen(false)
    } catch (err) {
      console.error('Failed to switch network:', err)
    } finally {
      setIsSwitching(false)
    }
  }

  return (
    <div className="relative">
      {/* Network Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all ${
          currentNetwork
            ? `bg-gradient-to-r ${currentNetwork.color} bg-opacity-10 border-${currentNetwork.name.toLowerCase()}-500/30 text-${currentNetwork.name.toLowerCase()}-400`
            : 'bg-slate-700/30 border-slate-600 text-slate-400'
        } hover:border-opacity-50 disabled:opacity-50 cursor-pointer`}
      >
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-start">
            <span className="text-xs font-medium">{chainName || 'Unknown'}</span>
            <span className="text-[10px] opacity-70">Testnet</span>
          </div>
          <ChevronDown
            size={14}
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-50 min-w-[180px] overflow-hidden">
          {AVAILABLE_TESTNETS.map(testnet => (
            <button
              key={testnet.chainId}
              onClick={() => handleSwitchNetwork(testnet.chainId)}
              disabled={isSwitching}
              className={`w-full px-4 py-2.5 text-xs text-left transition-all flex items-center justify-between ${
                chainId === testnet.chainId
                  ? 'bg-slate-800 border-l-2 border-emerald-500'
                  : 'hover:bg-slate-800/50 border-l-2 border-transparent'
              } disabled:opacity-50`}
            >
              <span className="font-medium">{testnet.name}</span>
              {chainId === testnet.chainId && <span className="text-emerald-400">✓</span>}
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
