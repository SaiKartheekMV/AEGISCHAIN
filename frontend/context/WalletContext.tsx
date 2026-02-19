'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ethers } from 'ethers'

interface WalletContextType {
  address: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.Signer | null
  isConnecting: boolean
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  isConnected: boolean
  chainId: number | null
  chainName: string | null
  balance: string | null
  isSepoliaTestnet: boolean
  switchNetwork: (chainId: number) => Promise<void>
}

export const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.Signer | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [chainName, setChainName] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)

  // Map chainId to network name
  const getChainName = (id: number): string => {
    switch (id) {
      case 1:
        return 'Ethereum Mainnet'
      case 11155111:
        return 'Sepolia Testnet'
      case 5:
        return 'Goerli Testnet'
      case 31337:
        return 'Hardhat Local'
      default:
        return `Network ${id}`
    }
  }

  const fetchBalance = useCallback(
    async (addr: string, prov: ethers.BrowserProvider) => {
      try {
        const bal = await prov.getBalance(addr)
        setBalance(ethers.formatEther(bal))
      } catch (err) {
        console.error('Error fetching balance:', err)
        setBalance(null)
      }
    },
    []
  )

  const fetchChainInfo = useCallback(async (prov: ethers.BrowserProvider) => {
    try {
      const network = await prov.getNetwork()
      const id = Number(network.chainId)
      setChainId(id)
      setChainName(getChainName(id))
    } catch (err) {
      console.error('Error fetching chain info:', err)
    }
  }, [])

  // Setup provider function
  const setupProvider = useCallback(
    async (walletAddress: string) => {
      try {
        if (!window.ethereum) {
          throw new Error('MetaMask not installed')
        }

        const provider = new ethers.BrowserProvider(window.ethereum as ethers.Eip1193Provider)
        const signer = await provider.getSigner()

        setProvider(provider)
        setSigner(signer)
        setAddress(walletAddress)
        setIsConnected(true)
        setError(null)

        // Fetch chain and balance info
        await fetchChainInfo(provider)
        await fetchBalance(walletAddress, provider)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to setup provider')
      }
    },
    [fetchChainInfo, fetchBalance]
  )

  // Check if wallet is already connected
  const checkWalletConnection = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) return

    try {
      const accounts = (await window.ethereum.request({
        method: 'eth_accounts',
      })) as string[]

      if (accounts.length > 0) {
        await setupProvider(accounts[0])
      }
    } catch (err) {
      console.error('Error checking wallet:', err)
    }
  }, [setupProvider])

  // Check connection on mount
  useEffect(() => {
    checkWalletConnection()
  }, [checkWalletConnection])

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      setError('MetaMask not installed. Please install MetaMask extension.')
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Request account access
      const accounts = (await window.ethereum.request({
        method: 'eth_requestAccounts',
      })) as string[]

      if (accounts.length > 0) {
        await setupProvider(accounts[0])
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to connect wallet')
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = useCallback(() => {
    setAddress(null)
    setProvider(null)
    setSigner(null)
    setIsConnected(false)
    setError(null)
    setChainId(null)
    setChainName(null)
    setBalance(null)
  }, [])

  const switchNetwork = useCallback(async (targetChainId: number) => {
    if (!window.ethereum) {
      setError('MetaMask not installed')
      return
    }

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }] as const as unknown as Parameters<typeof window.ethereum.request>[0]['params'],
      })
    } catch (switchError) {
      const error = switchError as { code?: number; message?: string }
      // If the network doesn't exist, add it
      if (error.code === 4902) {
        try {
          const networkConfigs: {
            [key: number]: {
              chainName: string
              rpcUrls: string[]
              nativeCurrency: { name: string; symbol: string; decimals: number }
              blockExplorerUrls: string[]
            }
          } = {
            11155111: {
              chainName: 'Sepolia',
              rpcUrls: ['https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
            5: {
              chainName: 'Goerli',
              rpcUrls: ['https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'],
              nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
              blockExplorerUrls: ['https://goerli.etherscan.io'],
            },
          }

          const config = networkConfigs[targetChainId]
          if (config) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${targetChainId.toString(16)}`,
                  chainName: config.chainName,
                  rpcUrls: config.rpcUrls,
                  nativeCurrency: config.nativeCurrency,
                  blockExplorerUrls: config.blockExplorerUrls,
                },
              ] as const as unknown as Parameters<typeof window.ethereum.request>[0]['params'],
            })
          }
        } catch (addError) {
          setError(`Failed to add network: ${addError instanceof Error ? addError.message : 'Unknown error'}`)
        }
      } else {
        setError(`Failed to switch network: ${error.message || 'Unknown error'}`)
      }
    }
  }, [])

  // Listen for account and chain changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return

    const handleAccountsChanged = (accounts: unknown) => {
      const accountList = accounts as string[]
      if (accountList.length === 0) {
        disconnectWallet()
      } else {
        setupProvider(accountList[0])
      }
    }

    const handleChainChanged = () => {
      // Refresh chain and balance info when network changes
      if (provider && address) {
        fetchChainInfo(provider)
        fetchBalance(address, provider)
      } else {
        window.location.reload()
      }
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      if (window.ethereum?.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
        window.ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [setupProvider, disconnectWallet, provider, address, fetchChainInfo, fetchBalance])

  return (
    <WalletContext.Provider
      value={{
        address,
        provider,
        signer,
        isConnecting,
        error,
        connectWallet,
        disconnectWallet,
        isConnected,
        chainId,
        chainName,
        balance,
        isSepoliaTestnet: chainId === 11155111,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within WalletProvider')
  }
  return context
}