import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, ShieldCheck, Clock, Users, ExternalLink,
         Star, TrendingUp, BarChart2, PauseCircle, CheckCircle, AlertCircle } from 'lucide-react'
import { usePrivy, useWallets } from '@privy-io/react-auth'
import Countdown from '../components/ui/Countdown'
import BidModal from '../components/ui/BidModal'
import { useAuctions } from '../hooks/useAuctions'
import { endAuction, explorerUrl } from '../lib/solana'

function TimeLeft({ endsAt }) {
  const ms = endsAt - Date.now()
  if (ms <= 0) return <span>Завршена</span>
  const h = Math.floor(ms / 3_600_000)
  const d = Math.floor(h / 24)
  if (d > 0) return <span>{d} {d === 1 ? 'ден' : 'дена'} и {h % 24} часа</span>
  if (h > 0) return <span>{h} {h === 1 ? 'час' : 'часа'}</span>
  const m = Math.floor(ms / 60_000)
  return <span className="text-riznica-red font-bold">Уште {m} минути!</span>
}

export default function AuctionDetail() {
  const { id }            = useParams()
  const { auctions, bid } = useAuctions()
  const { authenticated, user } = usePrivy()
  const { wallets }       = useWallets()
  const navigate          = useNavigate()

  const [showModal, setShowModal]     = useState(false)
  const [ownerAction, setOwnerAction] = useState(null)
  const [ownerError, setOwnerError]   = useState(null)
  const [ownerTx, setOwnerTx]         = useState(null)

  const solanaWallet = wallets.find(w => w.chainType === 'solana')
  const myAddr       = solanaWallet?.address || ''

  const auction = auctions.find(a => a.id === id)

  if (!auction) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-ink-muted px-4">
      <p className="text-lg">Предметот не е пронајден.</p>
      <Link to="/" className="text-base underline hover:text-ink">← Назад кон аукции</Link>
    </div>
  )

  const isEndingSoon = auction.endsAt - Date.now() < 1000 * 60 * 60 * 6
  const isEnded      = auction.endsAt < Date.now()
  const cats         = auction.categories || (auction.category ? [auction.category] : [])
  const imgSrc       = auction.image || `https://picsum.photos/seed/${id}/800/600`

  const isOwner = authenticated && myAddr && (
    auction.sellerWallet === myAddr ||
    auction.seller === myAddr ||
    auction.seller === 'Ти' ||
    auction.seller === user?.google?.name
  )

  const priceIncreasePct = auction.startingBid > 0
    ? Math.round(((auction.currentBid - auction.startingBid) / auction.startingBid) * 100)
    : 0

  async function handleEndAuction() {
    setOwnerAction('ending')
    setOwnerError(null)
    try {
      const result = await endAuction({
        auctionId:    id,
        sellerWallet: myAddr,
        wallet:       solanaWallet,
      })
      setOwnerTx(result.signature)
      setOwnerAction('done')
    } catch (e) {
      setOwnerError(e.message?.includes('User rejected')
        ? 'Ја откажа трансакцијата.'
        : e.message || 'Грешка при затворање')
      setOwnerAction(null)
    }
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-20">

      <Link to="/" className="inline-flex items-center gap-2 text-base text-ink-muted hover:text-ink transition-colors mb-6 sm:mb-8">
        <ArrowLeft size={16} /> Назад кон аукции
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

        {/* ── LEFT ── */}
        <div className="flex flex-col gap-5">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-parchment-2">
            <img src={imgSrc} alt={auction.title} className="w-full h-full object-cover"
              onError={e => { e.target.src = `https://picsum.photos/seed/${id}/800/600` }} />
            <div className="absolute top-4 left-4 flex flex-wrap gap-2">
              {cats.map(c => (
                <span key={c} className="tag bg-parchment/90 backdrop-blur-sm text-ink shadow-sm">{c}</span>
              ))}
            </div>
            {isEnded && (
              <div className="absolute inset-0 bg-ink/40 flex items-center justify-center">
                <span className="bg-parchment px-6 py-3 rounded-xl font-display text-lg font-semibold text-ink-soft">
                  Аукцијата завршена
                </span>
              </div>
            )}
          </div>

          {/* Автентичност */}
          <div className="flex items-start gap-4 bg-riznica-green/5 border border-riznica-green/25 rounded-xl p-4">
            <ShieldCheck size={22} strokeWidth={1.5} className="text-riznica-green flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-base font-semibold text-riznica-green mb-0.5">
                Дигитален сертификат за автентичност
              </p>
              <p className="text-sm text-ink-muted leading-relaxed">
                {auction.nftMinted
                  ? 'Сертификатот е издаден и зачуван засекогаш.'
                  : 'Победникот добива дигитален сертификат за оригиналност и сопственост.'}
              </p>
            </div>
          </div>

          {/* Продавач */}
          <div className="border border-parchment-3 rounded-xl divide-y divide-parchment-3 bg-white/40 text-sm">
            <div className="flex items-center justify-between px-4 py-3 gap-3">
              <span className="text-ink-muted font-medium">Продавач</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs text-ink-soft truncate">{auction.sellerWallet}</span>
                <a href={`https://explorer.solana.com/address/${auction.sellerWallet}?cluster=devnet`}
                  target="_blank" rel="noopener noreferrer" className="text-gold-dim hover:text-gold flex-shrink-0">
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-ink-muted font-medium">Верификација</span>
              <span className="text-sm font-medium text-riznica-green flex items-center gap-1.5">
                <ShieldCheck size={13} /> Верифицирано на блокчејн
              </span>
            </div>
          </div>

          {/* ── OWNER ANALYTICS ── */}
          {isOwner && (
            <div className="border-2 border-gold/30 bg-gold/5 rounded-xl p-5 flex flex-col gap-4">
              <p className="text-sm font-bold uppercase tracking-wider text-gold-dim flex items-center gap-2">
                <BarChart2 size={15} /> Аналитики за твојот оглас
              </p>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-display font-bold text-ink">{auction.bids}</p>
                  <p className="text-xs text-ink-muted mt-0.5 flex items-center justify-center gap-1">
                    <Users size={11} /> Понуди
                  </p>
                </div>
                <div className="bg-white/50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-display font-bold text-ink">{auction.currentBid} $</p>
                  <p className="text-xs text-ink-muted mt-0.5 flex items-center justify-center gap-1">
                    <TrendingUp size={11} /> Тековна
                  </p>
                </div>
                <div className="bg-white/50 rounded-xl p-3 text-center">
                  <p className={`text-2xl font-display font-bold ${priceIncreasePct > 0 ? 'text-riznica-green' : 'text-ink'}`}>
                    +{priceIncreasePct}%
                  </p>
                  <p className="text-xs text-ink-muted mt-0.5">Раст</p>
                </div>
              </div>

              {auction.currentBidder && (
                <div className="bg-white/50 rounded-xl px-4 py-3 text-sm">
                  <p className="text-ink-muted mb-0.5">Тековен купувач</p>
                  <p className="font-mono text-ink-soft text-xs">{auction.currentBidder.slice(0,8)}...</p>
                </div>
              )}

              {ownerAction === 'done' ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-riznica-green font-medium">
                    <CheckCircle size={16} /> Аукцијата е затворена успешно.
                  </div>
                  {ownerTx && (
                    <a href={explorerUrl(ownerTx)} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-gold-dim hover:underline flex items-center gap-1">
                      Погледни трансакција <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {ownerError && (
                    <div className="flex items-center gap-2 text-xs text-riznica-red bg-red-50 rounded-lg px-3 py-2">
                      <AlertCircle size={13} /> {ownerError}
                    </div>
                  )}
                  {!isEnded ? (
                    <button onClick={handleEndAuction} disabled={ownerAction === 'ending'}
                      className="flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-xl
                                 border border-riznica-red/30 text-riznica-red hover:bg-riznica-red/5
                                 transition-colors disabled:opacity-50 font-medium">
                      <PauseCircle size={15} />
                      {ownerAction === 'ending' ? 'Обработување…' : 'Затвори аукција рано'}
                    </button>
                  ) : auction.bids > 0 ? (
                    <button onClick={handleEndAuction} disabled={ownerAction === 'ending'}
                      className="flex items-center justify-center gap-2 text-sm px-4 py-3 rounded-xl
                                 border border-riznica-green/30 text-riznica-green hover:bg-riznica-green/5
                                 transition-colors disabled:opacity-50 font-medium">
                      <CheckCircle size={15} />
                      {ownerAction === 'ending' ? 'Обработување…' : 'Прими ги парите'}
                    </button>
                  ) : (
                    <p className="text-sm text-ink-muted italic text-center py-2">
                      Аукцијата истече без понуди.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT ── */}
        <div className="flex flex-col gap-5">
          <div>
            <div className="flex items-center gap-3 mb-2 text-sm text-ink-muted">
              <span className="font-semibold text-ink-soft">{auction.seller}</span>
              <span className="flex items-center gap-1"><MapPin size={13} />{auction.location}</span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight text-ink mb-3">
              {auction.title}
            </h1>
            <p className="text-base font-serif text-ink-soft leading-relaxed">{auction.description}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 py-4 border-y border-parchment-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Почетна</span>
              <span className="text-lg font-display font-bold text-ink">{auction.startingBid} $</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted flex items-center gap-1">
                <Users size={10} /> Понуди
              </span>
              <span className="text-lg font-display font-bold text-ink">{auction.bids}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className={`text-xs font-semibold uppercase tracking-wide flex items-center gap-1
                ${isEndingSoon ? 'text-riznica-red' : 'text-ink-muted'}`}>
                <Clock size={10} /> Преостанато
              </span>
              <span className={`text-sm font-semibold ${isEndingSoon ? 'text-riznica-red' : 'text-ink'}`}>
                <TimeLeft endsAt={auction.endsAt} />
              </span>
            </div>
          </div>

          {/* Bid box */}
          <div className="bg-white/60 border-2 border-parchment-3 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted mb-1">
                  Тековна понуда
                </p>
                <p className="font-display text-4xl font-bold leading-none text-ink">
                  {auction.currentBid}
                  <span className="font-body text-lg font-normal text-ink-muted ml-1.5">$</span>
                </p>
              </div>

              {isOwner ? (
                <span className="text-sm font-medium text-gold-dim bg-gold/10 border border-gold/20
                                 px-4 py-2.5 rounded-xl text-center whitespace-nowrap">
                  Твој оглас
                </span>
              ) : isEnded ? (
                <span className="text-sm text-ink-muted bg-parchment-3 px-4 py-2.5 rounded-xl font-medium">
                  Завршена
                </span>
              ) : authenticated ? (
                <button onClick={() => setShowModal(true)}
                  className="bg-ink text-parchment font-semibold text-base px-6 py-3 rounded-xl
                             hover:opacity-85 transition-opacity flex items-center gap-2 whitespace-nowrap">
                  Понуди сега →
                </button>
              ) : (
                <button onClick={() => navigate('/login')}
                  className="bg-ink text-parchment font-semibold text-sm px-5 py-3 rounded-xl
                             hover:opacity-85 transition-opacity whitespace-nowrap">
                  Влези за да понудиш
                </button>
              )}
            </div>
          </div>

          {/* Kako funkcjonira — samo za kupuvaci */}
          {!isOwner && (
            <div className="bg-white/40 rounded-xl p-4">
              <p className="text-sm font-bold uppercase tracking-wider text-ink-soft mb-3 flex items-center gap-2">
                <Star size={13} /> Како функционира?
              </p>
              <ol className="flex flex-col gap-3 list-none">
                {[
                  'Влези со твојот Google account',
                  'Постави понуда — парите се чуваат безбедно',
                  'Ако некој понуди повеќе, парите ти се враќаат автоматски',
                  'Победникот добива предметот и дигитален сертификат',
                ].map((text, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="step-badge">{i + 1}</span>
                    <span className="text-sm text-ink-soft leading-relaxed">{text}</span>
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
          connected={authenticated}
          onConnect={() => navigate('/login')}
        />
      )}
    </main>
  )
}