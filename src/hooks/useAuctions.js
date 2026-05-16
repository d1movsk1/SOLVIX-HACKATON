import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchAuctions, placeBid } from '../lib/solana'

export function useAuctions() {
  const [auctions, setAuctions]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [chainLoaded, setChainLoaded] = useState(false)
  const pollingRef                    = useRef(null)

  useEffect(() => {
    loadFromChain()
    pollingRef.current = setInterval(loadFromChain, 15_000)
    return () => clearInterval(pollingRef.current)
  }, [])

  async function loadFromChain() {
    try {
      const data = await fetchAuctions()
      setAuctions(data)
      setChainLoaded(true)
    } catch (err) {
      console.warn('fetchAuctions failed:', err.message)
    } finally {
      setLoading(false)
    }
  }

  const bid = useCallback(async (auctionId, amount) => {
    // Земи Phantom директно
    const phantom = window.solana?.isPhantom ? window.solana : null
    if (!phantom) return { success: false, error: 'Инсталирај го Phantom паричникот' }
    if (!phantom.isConnected) {
      try { await phantom.connect() }
      catch { return { success: false, error: 'Паричникот не е поврзан' } }
    }

    const walletAdapter = {
      publicKey:           phantom.publicKey,
      signTransaction:     (tx) => phantom.signTransaction(tx),
      signAllTransactions: (txs) => phantom.signAllTransactions(txs),
    }

    try {
      const auction = auctions.find(a => a.id === auctionId)
      const result  = await placeBid({
        auctionId,
        amount,
        prevBidderWallet: auction?.currentBidder || null,
        wallet:           walletAdapter,
      })
      setAuctions(prev => prev.map(a =>
        a.id === auctionId ? { ...a, currentBid: amount, bids: a.bids + 1 } : a
      ))
      setTimeout(loadFromChain, 3000)
      return { success: true, signature: result.signature }
    } catch (e) {
      return { success: false, error: e.message }
    }
  }, [auctions])

  const addAuction = useCallback((auction) => {
    setAuctions(prev => [auction, ...prev])
    setTimeout(loadFromChain, 4000)
  }, [])

  return { auctions, loading, chainLoaded, bid, addAuction }
}