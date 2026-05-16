import { createContext, useContext, useState, useCallback } from 'react'
import { MOCK_AUCTIONS } from '../lib/mockData'
import { placeBid } from '../lib/solana'

const AuctionsContext = createContext(null)

export function AuctionsProvider({ children }) {
  const [auctions, setAuctions] = useState(MOCK_AUCTIONS)
  const [loading, setLoading] = useState(false)

  const bid = useCallback(async (auctionId, amount) => {
    setLoading(true)
    try {
      const result = await placeBid({ auctionId, amount })
      setAuctions(prev => prev.map(a =>
        a.id === auctionId ? { ...a, currentBid: amount, bids: a.bids + 1 } : a
      ))
      return { success: true, signature: result.signature }
    } catch (e) {
      return { success: false, error: e.message }
    } finally {
      setLoading(false)
    }
  }, [])

  const addAuction = useCallback((auction) => {
    setAuctions(prev => [auction, ...prev])
  }, [])

  return (
    <AuctionsContext.Provider value={{ auctions, loading, bid, addAuction }}>
      {children}
    </AuctionsContext.Provider>
  )
}

export function useAuctions() {
  return useContext(AuctionsContext)
}