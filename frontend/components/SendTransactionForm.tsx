'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Send, AlertCircle, CheckCircle, Clock, Zap } from 'lucide-react'
import { agentApi, aiApi } from '@/lib/api'
import { sendGuardedTransaction } from '@/lib/guardedTx'
import { useWallet } from '@/hooks/useWallet'
import { ethers } from 'ethers'

type ResultStatus = 'analyzing' | 'pending' | 'blocked' | 'completed' | 'error'
type InputMode = 'natural' | 'manual'

interface TransactionResult {
  status: ResultStatus
  txId?: string
  txHash?: string
  message: string
  riskScore?: number
  riskLevel?: string
  aiExplanation?: string
  blockReason?: string
}

interface ParsedTx {
  to_address: string
  amount: number
  ai_confidence: number
  reasoning: string
  parsed_from: string
  transaction_type: string
  is_protocol_interaction: boolean
  protocol_name?: string | null
}

const DEFAULT_INTENT = 'Send 0.01 ETH to 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'
const DEFAULT_ADDRESS = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb'

const QUICK_INTENTS = [
  { label: 'Wallet Transfer', value: DEFAULT_INTENT },
  { label: 'Uniswap Swap', value: 'Swap 0.02 ETH on Uniswap' },
  { label: 'Hallucination Test', value: 'Send money to Bob' },
] as const

const RESULT_THEME: Record<ResultStatus, { panel: string; text: string }> = {
  completed: { panel: 'bg-emerald-500/10 border-emerald-500/30', text: 'text-emerald-400' },
  blocked: { panel: 'bg-red-500/10 border-red-500/30', text: 'text-red-400' },
  pending: { panel: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400' },
  analyzing: { panel: 'bg-sky-500/10 border-sky-500/30', text: 'text-sky-400' },
  error: { panel: 'bg-orange-500/10 border-orange-500/30', text: 'text-orange-400' },
}

const inputClass =
  'w-full px-4 py-3 bg-[#0f1629] border border-[#1e2d4a] rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500/50 transition disabled:opacity-50'

function getStatusIcon(status: ResultStatus) {
  if (status === 'completed') return <CheckCircle size={20} className="text-emerald-400 mt-0.5 flex-shrink-0" />
  if (status === 'blocked') return <AlertCircle size={20} className="text-red-400 mt-0.5 flex-shrink-0" />
  if (status === 'pending') return <Clock size={20} className="text-orange-400 mt-0.5 flex-shrink-0" />
  if (status === 'analyzing') return <Clock size={20} className="text-sky-400 mt-0.5 animate-spin flex-shrink-0" />
  return <AlertCircle size={20} className="text-orange-400 mt-0.5 flex-shrink-0" />
}

function parsePositiveAmount(amount: string): number | null {
  const value = parseFloat(amount)
  if (!Number.isFinite(value) || value <= 0) return null
  return value
}

export default function SendTransactionForm() {
  const { address, signer, isConnected } = useWallet()

  const [inputMode, setInputMode] = useState<InputMode>('natural')
  const [userIntent, setUserIntent] = useState(DEFAULT_INTENT)
  const [manualAddress, setManualAddress] = useState(DEFAULT_ADDRESS)
  const [manualAmount, setManualAmount] = useState('0.01')
  const [parseLoading, setParseLoading] = useState(false)
  const [parsedTx, setParsedTx] = useState<ParsedTx | null>(null)

  const [recipientAddress, setRecipientAddress] = useState('')
  const [amountEth, setAmountEth] = useState('')
  const [intent, setIntent] = useState('')

  const [loading, setLoading] = useState(false)
  const [agentRegistered, setAgentRegistered] = useState(false)
  const [agentRegistering, setAgentRegistering] = useState(false)
  const [registeredAgentAddress, setRegisteredAgentAddress] = useState<string | null>(null)

  const [result, setResult] = useState<TransactionResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const disableInputs = useMemo(
    () => loading || !isConnected || !agentRegistered,
    [loading, isConnected, agentRegistered]
  )

  const resetInputForm = useCallback(() => {
    setInputMode('natural')
    setUserIntent(DEFAULT_INTENT)
    setManualAddress(DEFAULT_ADDRESS)
    setManualAmount('0.01')
    setParseLoading(false)
    setParsedTx(null)
    setRecipientAddress('')
    setAmountEth('')
    setIntent('')
  }, [])

  const resetForm = useCallback(() => {
    resetInputForm()
    setResult(null)
    setError(null)
  }, [resetInputForm])

  const registerAgent = useCallback(async (walletAddress: string) => {
    if (!walletAddress) return

    try {
      setAgentRegistering(true)
      setError(null)
      await agentApi.autoRegister(walletAddress)
      setAgentRegistered(true)
      setRegisteredAgentAddress(walletAddress)
    } catch {
      setAgentRegistered(false)
      setRegisteredAgentAddress(null)
      setError('Unable to register agent for this wallet. Please retry.')
    } finally {
      setAgentRegistering(false)
    }
  }, [])

  useEffect(() => {
    if (!isConnected || !address) {
      setAgentRegistered(false)
      setAgentRegistering(false)
      setRegisteredAgentAddress(null)
      return
    }

    if (registeredAgentAddress && registeredAgentAddress !== address) {
      setAgentRegistered(false)
      setRegisteredAgentAddress(null)
    }
  }, [isConnected, address, registeredAgentAddress])

  useEffect(() => {
    if (
      isConnected &&
      address &&
      (!agentRegistered || registeredAgentAddress !== address) &&
      !agentRegistering
    ) {
      registerAgent(address)
    }
  }, [isConnected, address, agentRegistered, registeredAgentAddress, agentRegistering, registerAgent])

  const handleParseWithAi = useCallback(async () => {
    const normalizedIntent = userIntent.trim()
    if (!normalizedIntent) {
      setError('Please enter a transaction intent')
      return
    }

    try {
      setParseLoading(true)
      setError(null)
      const parsed = await aiApi.parseIntent({ intent: normalizedIntent })
      setParsedTx(parsed)
      setRecipientAddress(parsed.to_address)
      setAmountEth(parsed.amount > 0 ? String(parsed.amount) : '')
      setIntent(normalizedIntent)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to parse intent'
      setError(`Intent parsing failed: ${errorMsg}`)
    } finally {
      setParseLoading(false)
    }
  }, [userIntent])

  const handleUseManualInput = useCallback(() => {
    const normalizedAddress = manualAddress.trim()
    if (!ethers.isAddress(normalizedAddress)) {
      setError('Invalid manual recipient address')
      return
    }

    const amount = parsePositiveAmount(manualAmount)
    if (amount === null) {
      setError('Manual amount must be greater than 0')
      return
    }

    setError(null)

    const parsed: ParsedTx = {
      to_address: normalizedAddress,
      amount,
      ai_confidence: 100,
      reasoning: 'Manual input provided by user',
      parsed_from: 'manual_input',
      transaction_type: 'wallet_transfer',
      is_protocol_interaction: false,
      protocol_name: null,
    }

    setParsedTx(parsed)
    setRecipientAddress(normalizedAddress)
    setAmountEth(String(amount))
    setIntent(`Send ${amount} ETH to ${normalizedAddress.slice(0, 6)}...`)
  }, [manualAddress, manualAmount])

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (!isConnected || !address || !signer) {
        setError('Please connect your MetaMask wallet first')
        return
      }

      if (!agentRegistered) {
        setError('Registering your agent... please try again in a moment')
        return
      }

      if (!recipientAddress || !amountEth) {
        setError('Please fill in all required fields')
        return
      }

      const normalizedRecipient = recipientAddress.trim()
      if (!ethers.isAddress(normalizedRecipient)) {
        setError('Invalid recipient address')
        return
      }

      const valueEth = parsePositiveAmount(amountEth)
      if (valueEth === null) {
        setError('Amount must be greater than 0')
        return
      }

      try {
        setLoading(true)
        setError(null)
        setResult({ status: 'analyzing', message: 'Analyzing transaction with Guard AI...' })

        const response = await sendGuardedTransaction(signer, {
          agent_address: address,
          target_address: normalizedRecipient,
          value_eth: valueEth,
          intent: intent || `Send ${valueEth} ETH to ${normalizedRecipient.slice(0, 6)}...`,
          protocol: 'Native ETH Transfer',
        })

        if (response.decision === 'BLOCKED') {
          setResult({
            status: 'blocked',
            txId: response.txId,
            message: 'Transaction blocked by Guard AI',
            blockReason: response.validation?.block_reason,
            aiExplanation: response.validation?.ai_explanation,
            riskScore: response.validation?.risk_score,
            riskLevel: response.validation?.risk_level,
          })
          return
        }

        if (response.decision === 'PENDING') {
          setResult({
            status: 'pending',
            txId: response.txId,
            message: 'Transaction requires manual approval (high risk + high value)',
            aiExplanation: response.validation?.ai_explanation,
            riskScore: response.validation?.risk_score,
            riskLevel: response.validation?.risk_level,
          })
          return
        }

        if (response.decision === 'APPROVED' && response.sentTx) {
          setResult({
            status: 'completed',
            txId: response.txId,
            txHash: response.sentTx.hash,
            message: 'Transaction broadcast successfully!',
            aiExplanation: response.validation?.ai_explanation,
            riskScore: response.validation?.risk_score,
            riskLevel: response.validation?.risk_level,
          })
          resetInputForm()
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to send transaction'
        setError(errorMsg)
        setResult({ status: 'error', message: `Error: ${errorMsg}` })
      } finally {
        setLoading(false)
      }
    },
    [
      isConnected,
      address,
      signer,
      agentRegistered,
      recipientAddress,
      amountEth,
      intent,
      resetInputForm,
    ]
  )

  return (
    <div className="space-y-6">
      {!isConnected && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-sm text-red-400">Please connect your MetaMask wallet to send transactions</p>
        </div>
      )}

      {isConnected && !agentRegistered && (
        <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-4 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-sky-400/30 border-t-sky-400 rounded-full animate-spin" />
          <p className="text-sm text-sky-400">
            {agentRegistering ? 'Registering your agent in the system...' : 'Agent registered'}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-4 rounded-lg border border-[#1e2d4a] bg-[#0b1222] p-4">
          <p className="text-sm font-medium text-slate-200">Step 1: Collect Input</p>

          <div className="grid grid-cols-2 gap-2">
            {(['natural', 'manual'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setInputMode(mode)}
                disabled={disableInputs}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  inputMode === mode
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                } disabled:opacity-50`}
              >
                {mode === 'natural' ? 'Natural Language' : 'Manual Entry'}
              </button>
            ))}
          </div>

          {inputMode === 'natural' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {QUICK_INTENTS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setUserIntent(preset.value)}
                    disabled={disableInputs}
                    className="rounded-lg border border-slate-700 bg-slate-800 px-2 py-2 text-xs text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <textarea
                value={userIntent}
                onChange={(e) => setUserIntent(e.target.value)}
                placeholder="Describe your transaction in plain English"
                disabled={disableInputs}
                rows={3}
                className={inputClass}
              />

              <button
                type="button"
                onClick={handleParseWithAi}
                disabled={parseLoading || disableInputs}
                className="w-full rounded-lg border border-sky-500/40 bg-sky-500/15 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-500/25 disabled:opacity-50"
              >
                {parseLoading ? 'Parsing...' : 'Parse with AI'}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                value={manualAddress}
                onChange={(e) => setManualAddress(e.target.value)}
                placeholder="0x..."
                disabled={disableInputs}
                className={inputClass}
              />

              <input
                type="number"
                step="0.0001"
                min="0"
                value={manualAmount}
                onChange={(e) => setManualAmount(e.target.value)}
                placeholder="0.0"
                disabled={disableInputs}
                className={inputClass}
              />

              <button
                type="button"
                onClick={handleUseManualInput}
                disabled={disableInputs}
                className="w-full rounded-lg border border-sky-500/40 bg-sky-500/15 px-4 py-2 text-sm font-medium text-sky-300 transition hover:bg-sky-500/25 disabled:opacity-50"
              >
                Use Manual Input
              </button>
            </div>
          )}

          {parsedTx && (
            <div className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-3 text-xs text-slate-300 space-y-1">
              <p className="text-sky-300 font-medium">Parsed Transaction Ready</p>
              <p>Recipient: {parsedTx.to_address}</p>
              <p>Amount: {parsedTx.amount} ETH</p>
              <p>Confidence: {parsedTx.ai_confidence}%</p>
              <p>Source: {parsedTx.parsed_from}</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Recipient Address</label>
          <input
            type="text"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x..."
            disabled={disableInputs}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Amount (ETH)</label>
          <input
            type="number"
            step="0.0001"
            value={amountEth}
            onChange={(e) => setAmountEth(e.target.value)}
            placeholder="0.0"
            disabled={disableInputs}
            min="0"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">Intent (Optional)</label>
          <textarea
            value={intent}
            onChange={(e) => setIntent(e.target.value)}
            placeholder="What is this transaction for? (helps AI analysis)"
            disabled={disableInputs}
            rows={3}
            className={inputClass}
          />
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isConnected || !agentRegistered}
          className="w-full px-6 py-3 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-medium rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </>
          ) : !agentRegistered ? (
            <>
              <Zap size={18} />
              Register & Send
            </>
          ) : (
            <>
              <Send size={18} />
              Send Transaction
            </>
          )}
        </button>
      </form>

      {result && (
        <div className={`rounded-lg p-6 border space-y-4 ${RESULT_THEME[result.status].panel}`}>
          <div className="flex items-start gap-3">
            {getStatusIcon(result.status)}
            <div>
              <p className={`font-medium ${RESULT_THEME[result.status].text}`}>{result.message}</p>
            </div>
          </div>

          {result.txHash && (
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Transaction Hash:</p>
              <p className="text-sm font-mono text-slate-200 break-all">{result.txHash}</p>
            </div>
          )}

          {result.riskScore !== undefined && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Risk Score</p>
                <p className="text-lg font-bold text-slate-200">{result.riskScore}/100</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <p className="text-xs text-slate-400 mb-1">Risk Level</p>
                <p
                  className={`text-lg font-bold ${
                    result.riskLevel === 'CRITICAL'
                      ? 'text-red-400'
                      : result.riskLevel === 'HIGH'
                      ? 'text-orange-400'
                      : result.riskLevel === 'MEDIUM'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {result.riskLevel}
                </p>
              </div>
            </div>
          )}

          {result.aiExplanation && (
            <div className="bg-sky-500/10 border border-sky-500/20 rounded-lg p-3">
              <p className="text-xs text-sky-400 font-medium mb-2">Guard AI Analysis</p>
              <p className="text-xs text-slate-300 leading-relaxed">{result.aiExplanation}</p>
            </div>
          )}

          {result.blockReason && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <p className="text-xs text-red-400 font-medium mb-2">Block Reason</p>
              <p className="text-xs text-slate-300">{result.blockReason}</p>
            </div>
          )}

          {result.txId && (
            <div className="bg-slate-800/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">Transaction ID:</p>
              <p className="text-xs font-mono text-slate-400">{result.txId}</p>
            </div>
          )}

          <button
            onClick={() => (result.status === 'completed' ? resetForm() : setResult(null))}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg text-sm font-medium transition"
          >
            {result.status === 'completed' ? 'Send Another' : 'Close'}
          </button>
        </div>
      )}
    </div>
  )
}
