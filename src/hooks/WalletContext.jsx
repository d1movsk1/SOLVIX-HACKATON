import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { connectWallet, disconnectWallet, shortenAddress } from '../lib/solana'

const WalletContext = createContext(null)

export function WalletProvider({ children }) {
  const [publicKey, setPublicKey] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (window.solana?.isPhantom && window.solana.isConnected) {
      window.solana.connect({ onlyIfTrusted: true })
        .then(r => setPublicKey(r.publicKey.toString()))
        .catch(() => {})
    }
  }, [])

  const connect = useCallback(async () => {
    setConnecting(true)
    setError(null)
    try {
      const key = await connectWallet()
      setPublicKey(key)
    } catch (e) {
      setError(e.message)
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(async () => {
    await disconnectWallet()
    setPublicKey(null)
  }, [])

  return (
    <WalletContext.Provider value={{
      publicKey,
      shortKey: shortenAddress(publicKey),
      connected: !!publicKey,
      connecting,
      error,
      connect,
      disconnect,
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  return useContext(WalletContext)
}