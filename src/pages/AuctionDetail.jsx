import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Shield, Clock, Users, ExternalLink } from 'lucide-react'
import Countdown from '../components/ui/Countdown'
import BidModal from '../components/ui/BidModal'
import { useAuctions } from '../hooks/useAuctions'
import { useWallet } from '../hooks/useWallet'

export default function AuctionDetail() {
  const { id } = useParams()
  const { auctions, bid } = useAuctions()
  const { connected, connect } = useWallet()
  const [showModal, setShowModal] = useState(false)

  const auction = auctions.find(a => a.id === id)

  if (!auction) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-ink-muted px-4">
      <p>Предметот не е пронајден.</p>
      <Link to="/" className="text-sm underline hover:text-ink">← Назад</Link>
    </div>
  )

  const isEndingSoon = auction.endsAt - Date.now() < 1000 * 60 * 60 * 6
  const isEnded = auction.endsAt < Date.now()

  const Stat = ({ icon: Icon, label, value, urgent }) => (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 text-ink-muted">
        {Icon && <Icon size={12} />}
        <span className="text-xs uppercase tracking-widest">{label}</span>
      </div>
      <span className={`font-mono text-sm font-medium ${urgent ? 'text-riznica-red' : 'text-ink'}`}>
        {value}
      </span>
    </div>
  )

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-20">

      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-6 sm:mb-8">
        <ArrowLeft size={15} />
        Назад кон аукции
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

        {/* ── LEFT col ── */}
        <div className="flex flex-col gap-4">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-parchment-2">
            <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
            <span className="absolute top-4 left-4 tag bg-parchment/85 backdrop-blur-sm text-ink">
              {auction.category}
            </span>
          </div>

          {/* NFT badge */}
          <div className="flex items-start gap-3 bg-riznica-green/5 border border-riznica-green/20 rounded-xl p-4">
            <Shield size={18} strokeWidth={1.5} className="text-riznica-green flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-riznica-green mb-0.5">Верифициран со NFT</p>
              <p className="text-xs text-ink-muted">
                {auction.nftMinted
                  ? 'NFT е мintиран на Solana'
                  : 'NFT ќе биде мintиран за победникот на аукцијата'}
              </p>
            </div>
          </div>

          {/* Wallet info */}
          <div className="border border-parchment-3 rounded-xl divide-y divide-parchment-3 text-sm">
            <div className="flex items-center justify-between px-4 py-3 gap-3">
              <span className="text-ink-muted flex-shrink-0">Продавач</span>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-mono text-xs text-ink-soft truncate">{auction.sellerWallet}</span>
                <a
                  href={`https://explorer.solana.com/address/${auction.sellerWallet}?cluster=devnet`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-gold-dim hover:text-gold flex-shrink-0"
                >
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-ink-muted">Мрежа</span>
              <span className="devnet-badge">Solana Devnet</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT col ── */}
        <div className="flex flex-col gap-6">
          {/* Meta + title */}
          <div>
            <div className="flex items-center gap-3 mb-3 text-sm text-ink-muted">
              <span>{auction.seller}</span>
              <span className="flex items-center gap-1"><MapPin size={11} />{auction.location}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-medium leading-tight text-ink mb-4">
              {auction.title}
            </h1>
            <p className="text-sm font-light text-ink-soft leading-relaxed">{auction.description}</p>
          </div>

          {/* Stats */}
          <div className="flex gap-6 py-4 border-y border-parchment-3">
            <Stat label="Почетна цена" value={`${auction.startingBid} USDC`} />
            <Stat icon={Users} label="Понуди" value={auction.bids} />
            <Stat
              icon={Clock}
              label="Преостанато"
              value={<Countdown endsAt={auction.endsAt} />}
              urgent={isEndingSoon}
            />
          </div>

          {/* Bid box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between
                          gap-4 bg-parchment-2 border border-parchment-3 rounded-2xl p-5 sm:p-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-muted mb-1.5">Тековна понуда</p>
              <p className="font-display text-4xl font-semibold leading-none text-ink">
                {auction.currentBid}
                <span className="font-body text-base font-light text-ink-muted ml-1.5">USDC</span>
              </p>
            </div>

            {!isEnded ? (
              <button
                onClick={() => setShowModal(true)}
                className="sm:w-auto btn-primary sm:px-8 py-3.5"
              >
                Понуди сега
              </button>
            ) : (
              <span className="font-mono text-xs text-ink-muted bg-parchment-3 px-4 py-2 rounded-full">
                Аукцијата завршена
              </span>
            )}
          </div>

          {/* How it works */}
          <div className="bg-parchment-2 rounded-xl p-4 sm:p-5">
            <p className="text-xs font-medium uppercase tracking-widest text-ink-soft mb-3">
              Како функционира?
            </p>
            <ol className="flex flex-col gap-2.5 text-sm text-ink-soft list-none">
              {[
                'Поврзи го Phantom паричникот',
                'Постави понуда — USDC се заклучува во escrow',
                'Ако некој понуди повеќе, добиваш автоматско враќање',
                'Победникот добива предметот + NFT доказ за автентичност',
              ].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-gold/15 text-gold-dim
                                   font-mono text-xs flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {showModal && (
        <BidModal
          auction={auction}
          onClose={() => setShowModal(false)}
          onBid={bid}
          connected={connected}
          onConnect={connect}
        />
      )}
    </main>
  )
}
