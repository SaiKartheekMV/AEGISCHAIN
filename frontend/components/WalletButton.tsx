import React from 'react'
import { useWallet } from '@/context/WalletContext'
import { Wallet, LogOut, AlertCircle } from 'lucide-react'

export function WalletButton() {
  const { address, isConnecting, error, connectWallet, disconnectWallet, isConnected } = useWallet()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center gap-2">
          <Wallet className="text-blue-400" size={16} />
          <span className="text-sm font-medium text-blue-300">{formatAddress(address)}</span>
        </div>
        <button
          onClick={disconnectWallet}
          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors text-red-400 hover:text-red-300"
          title="Disconnect Wallet"
        >
          <LogOut size={18} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <Wallet size={18} />
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && (
        <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-2 rounded border border-red-500/20">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
