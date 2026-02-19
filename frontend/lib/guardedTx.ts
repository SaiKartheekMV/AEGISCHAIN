import { Signer } from "ethers"
import { transactionApi } from "./api"
import { ValidateTxRequest } from "@/types"

interface TxOverrides {
  data?: string
  gasLimit?: bigint | number
}

/**
 * sendGuardedTransaction
 * - Calls backend validation (AI + guardrails)
 * - If approved, opens MetaMask signer to send transaction
 * - After broadcast, notifies backend with tx_id and tx_hash for tracking
 */
export async function sendGuardedTransaction(
  signer: Signer,
  validateReq: ValidateTxRequest,
  txOverrides: TxOverrides = {}
) {
  // 1) Ask backend to validate
  const validation = await transactionApi.validate(validateReq)

  if (!validation) throw new Error("Validation service returned no response")

  const decision = validation.decision
  const txId = validation.tx_id

  if (decision !== "APPROVED") {
    return { decision, txId, validation }
  }

  // 2) Build transaction object for signer
  const txRequest: TxOverrides & { to: string; value?: bigint } = {
    to: validateReq.target_address,
    value: undefined,
    data: txOverrides.data ?? undefined,
    gasLimit: txOverrides.gasLimit,
  }

  // Convert ETH value to Wei (1 ETH = 10^18 Wei)
  if (validateReq.value_eth && validateReq.value_eth > 0) {
    try {
      // More precise conversion avoiding floating point issues
      const weiString = String(Math.floor(validateReq.value_eth * 1e18))
      txRequest.value = BigInt(weiString)
    } catch (e) {
      console.error("Error converting ETH to Wei:", e)
      throw new Error("Invalid ETH amount for transaction")
    }
  } else {
    delete txRequest.value
  }

  // 3) Prompt MetaMask to send transaction
  let sentTx
  try {
    sentTx = await signer.sendTransaction(txRequest)
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "MetaMask transaction failed"
    
    // User cancelled or transaction failed - still notify backend for audit
    if (errorMsg.includes("user rejected") || errorMsg.includes("User denied")) {
      console.log("User rejected transaction in MetaMask")
      throw new Error("Transaction cancelled by user")
    }
    
    throw new Error(`Failed to send transaction: ${errorMsg}`)
  }

  // 4) Notify backend of on-chain hash so agents can track and post-check
  try {
    await transactionApi.notify(txId, sentTx.hash)
  } catch (err) {
    // best-effort notify; log but don't fail the TX
    console.error("Failed to notify backend about tx hash", err)
  }

  return { decision, txId, sentTx, validation }
}
