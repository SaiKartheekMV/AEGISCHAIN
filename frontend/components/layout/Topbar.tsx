"use client"

import { useEffect, useState, useRef } from "react"
import { createPortal } from "react-dom"
import { Wifi, WifiOff, Wallet, LogOut, Copy, Check, AlertCircle } from "lucide-react"
import { healthApi } from "@/lib/api"
import { useWallet } from "@/context/WalletContext"
import NetworkSwitcher from "@/components/NetworkSwitcher"

export default function Topbar({ title }: { title: string }) {
  const [online, setOnline] = useState<boolean | null>(null)
  const [time, setTime] = useState<string>("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [copied, setCopied] = useState(false)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const { address, isConnected, connectWallet, disconnectWallet, chainName, chainId, balance, isSepoliaTestnet } =
    useWallet()

  // Backend health check
  useEffect(() => {
    healthApi.check()
      .then(() => setOnline(true))
      .catch(() => setOnline(false))
  }, [])

  // Hydration-safe clock
  useEffect(() => {
    const updateTime = () => {
      setTime(new Date().toLocaleTimeString())
    }

    updateTime()
    const interval = setInterval(updateTime, 1000)

    return () => clearInterval(interval)
  }, [])

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleConnectClick = async () => {
    await connectWallet()
    setShowDropdown(false)
  }

  const handleDisconnect = () => {
    disconnectWallet()
    setShowDropdown(false)
  }

  const updateDropdownPosition = () => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    // anchor the dropdown to the button's right edge
    const width = 280 // approximate dropdown width
    const left = Math.max(8, rect.right - width)
    setDropdownPos({ top: rect.bottom + window.scrollY + 8, left: left + window.scrollX })
  }

  useEffect(() => {
    if (showDropdown) {
      updateDropdownPosition()
      window.addEventListener('resize', updateDropdownPosition)
      window.addEventListener('scroll', updateDropdownPosition, true)
    }

    return () => {
      window.removeEventListener('resize', updateDropdownPosition)
      window.removeEventListener('scroll', updateDropdownPosition, true)
    }
  }, [showDropdown])

  const networkBgColor = isSepoliaTestnet ? 'bg-orange-500/10' : 'bg-slate-700/30'
  const networkBorderColor = isSepoliaTestnet ? 'border-orange-500/30' : 'border-slate-600'
  const networkTextColor = isSepoliaTestnet ? 'text-orange-400' : 'text-slate-400'

  return (
    <>
      <header className="h-14 border-b border-[#1e2d4a] bg-[#0f1629]/80 backdrop-blur flex items-center justify-between px-6">
        <h1 className="text-sm font-semibold text-slate-200">{title}</h1>

        <div className="flex items-center gap-6">
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

          {/* Network Status */}
          {isConnected && chainName && (
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${networkBgColor} ${networkBorderColor}`}
              >
                {!isSepoliaTestnet && <AlertCircle size={12} className="text-amber-400" />}
                <span className={networkTextColor}>{chainName}</span>
              </div>
              <NetworkSwitcher />
            </div>
          )}

          {/* Wallet Section */}
          <div className="relative">
            {isConnected && address ? (
              <button
                ref={btnRef}
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 hover:border-blue-500/50 transition-all cursor-pointer group"
              >
                <Wallet size={14} className="text-blue-400" />
                <div className="flex flex-col items-start">
                  <span className="text-xs font-medium text-blue-300">{formatAddress(address)}</span>
                  <span className="text-xs text-blue-400/70">{balance || '0'} ETH</span>
                </div>
              </button>
            ) : (
              <button
                onClick={handleConnectClick}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500/50 transition-all cursor-pointer"
              >
                <Wallet size={14} className="text-emerald-400" />
                <span className="text-xs font-medium text-emerald-300">Connect</span>
              </button>
            )}

            {/* Dropdown Menu */}
            {showDropdown && isConnected && address && createPortal(
              <div
                style={dropdownPos ? { top: dropdownPos.top, left: dropdownPos.left } : undefined}
                className="fixed bg-slate-900 border border-slate-700 rounded-lg shadow-lg z-[9999] min-w-[260px]"
              >
                {/* Network Info */}
                <div className="p-3 border-b border-slate-700">
                  <p className="text-xs text-slate-400 mb-2">Network</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-200">{chainName}</p>
                      <p className="text-xs text-slate-500">Chain ID: {chainId}</p>
                    </div>
                    {!isSepoliaTestnet && (
                      <div className="text-amber-400 text-xs font-medium text-right">
                        ⚠️ Not Sepolia
                      </div>
                    )}
                    {isSepoliaTestnet && (
                      <div className="text-emerald-400 text-xs font-medium">
                        ✓ Testnet
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Info */}
                <div className="p-3 border-b border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Connected Account</p>
                  <div className="flex items-center justify-between gap-2">
                    <code className="text-xs font-mono text-slate-200 break-all">{address}</code>
                    <button
                      onClick={handleCopyAddress}
                      className="flex-shrink-0 p-1 rounded hover:bg-slate-800 transition-colors"
                      title="Copy address"
                    >
                      {copied ? (
                        <Check size={14} className="text-emerald-400" />
                      ) : (
                        <Copy size={14} className="text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Balance Info */}
                <div className="p-3 border-b border-slate-700">
                  <p className="text-xs text-slate-400 mb-1">Balance</p>
                  <p className="text-sm font-medium text-emerald-400">{balance || '0'} ETH</p>
                  {!isSepoliaTestnet && (
                    <p className="text-xs text-amber-400 mt-1">⚠️ Mainnet balance - Use only for important transfers</p>
                  )}
                  {isSepoliaTestnet && (
                    <p className="text-xs text-sky-400 mt-1">ℹ️ Testnet balance - Safe for testing</p>
                  )}
                </div>

                {/* Actions */}
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors border-t border-slate-700"
                >
                  <LogOut size={14} />
                  <span>Disconnect Wallet</span>
                </button>
              </div>,
              // render into document.body so it escapes local stacking contexts
              (typeof document !== 'undefined' ? document.body : null)
            )}
          </div>

          <div className="text-xs text-slate-500 font-mono">
            {time}
          </div>
        </div>
      </header>

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-100"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </>
  )
}
