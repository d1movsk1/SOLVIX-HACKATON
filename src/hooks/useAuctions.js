import { useState, useEffect, useCallback, useRef } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { fetchAuctions, placeBid } from '../lib/solana'

export function useAuctions() {
  const wallet = useWallet()
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
    if (!wallet?.publicKey) return { success: false, error: 'Паричникот не е поврзан' }
    try {
      const auction = auctions.find(a => a.id === auctionId)
      const result  = await placeBid({
        auctionId,
        amount,
        prevBidderWallet: auction?.currentBidder || null,
        wallet,
      })
      setAuctions(prev => prev.map(a =>
        a.id === auctionId ? { ...a, currentBid: amount, bids: a.bids + 1 } : a
      ))
      setTimeout(loadFromChain, 3000)
      return { success: true, signature: result.signature }
    } catch (e) {
      return { success: false, error: e.message }
    }
  }, [auctions, wallet])

  const addAuction = useCallback((auction) => {
    setAuctions(prev => [auction, ...prev])
    setTimeout(loadFromChain, 4000)
  }, [])

  return { auctions, loading, chainLoaded, bid, addAuction }
}
