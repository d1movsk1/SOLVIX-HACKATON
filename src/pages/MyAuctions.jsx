import { Link } from 'react-router-dom'
import { ArrowLeft, Plus } from 'lucide-react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import AuctionCard from '../components/ui/AuctionCard'
import { useAuctions } from '../hooks/useAuctions'

export default function MyAuctions() {
  const { auctions } = useAuctions()
  const { user } = usePrivy()
  const { wallets } = useWallets()

  const solanaWallet = wallets.find(w => w.chainType === 'solana')
  const myAddr = solanaWallet?.address || ''

  const mine = auctions.filter(a =>
    a.sellerWallet === myAddr ||
    a.seller === myAddr ||
    a.seller === 'Ти'
  )

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 pb-20">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-6">
        <ArrowLeft size={15} /> Назад
      </Link>
      <div className="mb-8">
        <h1 className="font-display text-4xl font-medium text-ink mb-2">Мои аукции</h1>
        <p className="text-ink-muted text-sm">Тука можеш да ги видиш сите аукции што си ги креирал.</p>
      </div>
      {mine.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {mine.map(a => <AuctionCard key={a.id} auction={a} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center border-2 border-dashed border-parchment-3 rounded-2xl">
          <p className="text-ink-muted text-sm">Немаш креирано аукции.</p>
          <Link to="/sell" className="btn-primary max-w-xs">
            <Plus size={15} /> Листај прв предмет
          </Link>
        </div>
      )}
    </main>
  )
}