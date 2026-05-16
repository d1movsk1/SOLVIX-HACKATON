import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Shield, Clock, Users, ExternalLink, PauseCircle, Edit, CheckCircle, AlertCircle } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import Countdown from '../components/ui/Countdown'
import BidModal from '../components/ui/BidModal'
import { useAuctions } from '../hooks/useAuctions'
import { endAuction, explorerUrl } from '../lib/solana'

export default function AuctionDetail() {
  const { id }                 = useParams()
  const { auctions, bid }      = useAuctions()
  const wallet                 = useWallet()
  const { connected, publicKey } = wallet
  const { setVisible }         = useWalletModal()
  const [showModal, setShowModal]   = useState(false)
  const [ownerAction, setOwnerAction] = useState(null) // null | 'ending' | 'done'
  const [ownerError, setOwnerError]   = useState(null)
  const [ownerTx, setOwnerTx]         = useState(null)

  const auction = auctions.find(a => a.id === id)

  if (!auction) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-ink-muted px-4">
      <p>Предметот не е пронајден.</p>
      <Link to="/" className="text-sm underline hover:text-ink">← Назад</Link>
    </div>
  )

  const isEndingSoon = auction.endsAt - Date.now() < 1000 * 60 * 60 * 6
  const isEnded      = auction.ended || auction.endsAt < Date.now()
  const myAddr       = publicKey?.toString() || ''

  // Owner check — sporeduvaj so celata adresa
  const isOwner = connected && myAddr && (
    auction.sellerWallet === myAddr ||
    auction.seller === myAddr
  )

  async function handleEndAuction() {
    setOwnerAction('ending')
    setOwnerError(null)
    try {
      const result = await endAuction({
        auctionId:    id,
        sellerWallet: myAddr,
        wallet,
      })
      setOwnerTx(result.signature)
      setOwnerAction('done')
    } catch (e) {
      console.error('endAuction error:', e)
      setOwnerError(e.message?.includes('User rejected')
        ? 'Ја откажа трансакцијата.'
        : e.message || 'Грешка при затворање')
      setOwnerAction(null)
    }
  }

  const cats = auction.categories || (auction.category ? [auction.category] : [])

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
        <ArrowLeft size={15} /> Назад кон аукции
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

        {/* ── LEFT ── */}
        <div className="flex flex-col gap-4">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-parchment-2">
            <img src={auction.image} alt={auction.title} className="w-full h-full object-cover" />
            <div className="absolute top-4 left-4 flex flex-wrap gap-1.5 max-w-[80%]">
              {cats.map(c => (
                <span key={c} className="tag bg-parchment/85 backdrop-blur-sm text-ink">{c}</span>
              ))}
            </div>
          </div>

          {/* NFT badge */}
          <div className="flex items-start gap-3 bg-riznica-green/5 border border-riznica-green/20 rounded-xl p-4">
            <Shield size={18} strokeWidth={1.5} className="text-riznica-green flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-riznica-green mb-0.5">Верифициран со NFT</p>
              <p className="text-xs text-ink-muted">
                {auction.nftMinted ? 'NFT е мintиран на Solana' : 'NFT ќе биде мintиран за победникот'}
              </p>
            </div>
          </div>

          {/* Chain info */}
          <div className="border border-parchment-3 rounded-xl divide-y divide-parchment-3 text-sm bg-white/50">
            <div className="flex items-center justify-between px-4 py-3 gap-3">
              <span className="text-ink-muted flex-shrink-0">Продавач</span>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-mono text-xs text-ink-soft truncate">{auction.sellerWallet}</span>
                <a href={`https://explorer.solana.com/address/${auction.sellerWallet}?cluster=devnet`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-gold-dim hover:text-gold flex-shrink-0">
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-ink-muted">Мрежа</span>
              <span className="devnet-badge">Solana Devnet</span>
            </div>
            {auction.id && (
              <div className="flex items-center justify-between px-4 py-3 gap-3">
                <span className="text-ink-muted flex-shrink-0">On-chain ID</span>
                <a href={`https://explorer.solana.com/address/${auction.id}?cluster=devnet`}
                  target="_blank" rel="noopener noreferrer"
                  className="font-mono text-xs text-gold-dim hover:text-gold flex items-center gap-1 truncate">
                  {auction.id.slice(0,8)}...
                  <ExternalLink size={10} />
                </a>
              </div>
            )}
          </div>

          {/* ── OWNER PANEL ── */}
          {isOwner && (
            <div className="border-2 border-gold/30 bg-gold/5 rounded-xl p-4 flex flex-col gap-3">
              <p className="text-xs font-medium uppercase tracking-widest text-gold-dim flex items-center gap-1.5">
                <Edit size={12} /> Твој оглас — управување
              </p>

              {ownerAction === 'done' ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-riznica-green">
                    <CheckCircle size={16} />
                    Аукцијата е затворена. USDC испратен до тебе.
                  </div>
                  {ownerTx && (
                    <a href={explorerUrl(ownerTx)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 font-mono text-xs text-gold-dim hover:text-gold underline">
                      Погледни трансакција <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="text-xs text-ink-muted space-y-0.5">
                    <p>{auction.bids === 0 ? 'Сè уште нема понуди.' : `${auction.bids} понуди`}</p>
                    {auction.bids > 0 && (
                      <p>Тековна понуда: <span className="font-medium text-ink">{auction.currentBid} USDC</span></p>
                    )}
                    {auction.currentBidder && (
                      <p className="font-mono">Купувач: {auction.currentBidder.slice(0,8)}...</p>
                    )}
                  </div>

                  {ownerError && (
                    <div className="flex items-center gap-2 text-xs text-riznica-red bg-red-50 rounded-lg px-3 py-2">
                      <AlertCircle size={13} /> {ownerError}
                    </div>
                  )}

                  {!isEnded && (
                    <button onClick={handleEndAuction} disabled={ownerAction === 'ending'}
                      className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border border-riznica-red/30
                                 text-riznica-red hover:bg-riznica-red/5 transition-colors disabled:opacity-50">
                      <PauseCircle size={15} />
                      {ownerAction === 'ending' ? 'Потпиши во Phantom…' : 'Затвори аукција рано'}
                    </button>
                  )}

                  {isEnded && auction.bids > 0 && (
                    <button onClick={handleEndAuction} disabled={ownerAction === 'ending'}
                      className="flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl border border-riznica-green/30
                                 text-riznica-green hover:bg-riznica-green/5 transition-colors disabled:opacity-50">
                      <CheckCircle size={15} />
                      {ownerAction === 'ending' ? 'Потпиши во Phantom…' : 'Прими ги парите (USDC)'}
                    </button>
                  )}

                  {isEnded && auction.bids === 0 && (
                    <p className="text-xs text-ink-muted italic">
                      Аукцијата истече без понуди.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT ── */}
        <div className="flex flex-col gap-6">
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
            <Stat icon={Clock} label="Преостанато"
              value={<Countdown endsAt={auction.endsAt} />} urgent={isEndingSoon} />
          </div>

          {/* Bid box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between
                          gap-4 bg-white/60 border border-parchment-3 rounded-2xl p-5 sm:p-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-ink-muted mb-1.5">Тековна понуда</p>
              <p className="font-display text-4xl font-semibold leading-none text-ink">
                {auction.currentBid}
                <span className="font-body text-base font-light text-ink-muted ml-1.5">USDC</span>
              </p>
            </div>

            {isOwner ? (
              <span className="font-mono text-xs text-gold-dim bg-gold/10 border border-gold/20 px-4 py-2 rounded-full text-center">
                Твој оглас
              </span>
            ) : isEnded ? (
              <span className="font-mono text-xs text-ink-muted bg-parchment-3 px-4 py-2 rounded-full">
                Аукцијата завршена
              </span>
            ) : connected ? (
              <button onClick={() => setShowModal(true)} className="sm:w-auto btn-primary sm:px-8 py-3.5">
                Понуди сега
              </button>
            ) : (
              <button onClick={() => setVisible(true)} className="sm:w-auto btn-secondary sm:px-8 py-3.5">
                Поврзи паричник
              </button>
            )}
          </div>

          {/* How it works — only for non-owners */}
          {!isOwner && (
            <div className="bg-white/50 rounded-xl p-4 sm:p-5">
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
          )}
        </div>
      </div>

      {showModal && (
        <BidModal
          auction={auction}
          onClose={() => setShowModal(false)}
          onBid={bid}
          connected={connected}
          onConnect={() => setVisible(true)}
        />
      )}
    </main>
  )
}
