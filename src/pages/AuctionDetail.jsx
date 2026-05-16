import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, MapPin, Shield, Clock, Users, ExternalLink, Mail, Award } from 'lucide-react'
import Countdown from '../components/ui/Countdown'
import BidModal from '../components/ui/BidModal'
import { useAuctions } from '../hooks/AuctionsContext'
import { useWallet } from '../hooks/WalletContext'
import { sendNFTEmail } from '../lib/sendNFTEmail'

function Stat({ label, value, icon: Icon, urgent }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-widest text-ink-muted">{label}</span>
      <span className={`font-display text-xl font-medium ${urgent ? 'text-riznica-red' : 'text-ink'}`}>
        {Icon && <Icon size={14} className="inline mr-1" />}{value}
      </span>
    </div>
  )
}

export default function AuctionDetail() {
  const { id } = useParams()
  const { auctions, bid } = useAuctions()
  const { connected, connect } = useWallet()
  const [showModal, setShowModal] = useState(false)
  const [nftSending, setNftSending] = useState(false)
  const [nftSent, setNftSent] = useState(false)
  const [nftError, setNftError] = useState(null)
  const [winnerEmail, setWinnerEmail] = useState('')
  const [winnerName, setWinnerName] = useState('')
  const [showNftForm, setShowNftForm] = useState(false)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const auction = auctions.find(a => a.id === id)

  if (!auction) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-ink-muted px-4">
      <p>Предметот не е пронајден.</p>
      <Link to="/" className="text-sm underline hover:text-ink">← Назад</Link>
    </div>
  )

  const isEnded = now > auction.endsAt
  const isEndingSoon = !isEnded && auction.endsAt - now < 3_600_000

  async function handleSendNFT() {
    if (!winnerEmail || !winnerName) return
    setNftSending(true)
    setNftError(null)
    try {
      await sendNFTEmail({ auction, winnerEmail, winnerName })
      setNftSent(true)
      setShowNftForm(false)
    } catch (err) {
      console.error(err)
      setNftError('Грешка при испраќање. Провери го мејлот и пробај повторно.')
    } finally {
      setNftSending(false)
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-20">

      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-6">
        <ArrowLeft size={15} /> Назад
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

        {/* ── LEFT col ── */}
        <div className="flex flex-col gap-4">
          <div className="w-full aspect-video bg-parchment-2 rounded-2xl overflow-hidden">
            <img src={auction.image} alt={auction.title} className="w-full h-full object-contain" />
          </div>

          <div className="flex items-center gap-2 text-xs text-ink-muted bg-parchment-2 rounded-xl px-4 py-3">
            <Shield size={13} className="text-riznica-green" />
            <p className="text-xs text-ink-muted">
              {auction.nftMinted ? 'NFT е минтиран на Solana' : 'NFT ќе биде минтиран за победникот на аукцијата'}
            </p>
          </div>

          <div className="border border-parchment-3 rounded-xl divide-y divide-parchment-3 text-sm">
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
          </div>
        </div>

        {/* ── RIGHT col ── */}
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

          <div className="flex gap-6 py-4 border-y border-parchment-3">
            <Stat label="Почетна цена" value={`${auction.startingBid} USDC`} />
            <Stat icon={Users} label="Понуди" value={auction.bids} />
            <Stat icon={Clock} label="Преостанато"
              value={<Countdown endsAt={auction.endsAt} />} urgent={isEndingSoon} />
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
              <button onClick={() => setShowModal(true)} className="sm:w-auto btn-primary sm:px-8 py-3.5">
                Понуди сега
              </button>
            ) : (
              <span className="font-mono text-xs text-ink-muted bg-parchment-3 px-4 py-2 rounded-full">
                Аукцијата завршена
              </span>
            )}
          </div>

          {/* NFT секција */}
          {isEnded && (
            <div className="border-2 border-dashed border-parchment-3 rounded-2xl p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-gold-dim" />
                <p className="font-medium text-ink">Испрати NFT сертификат на победникот</p>
              </div>

              {nftSent ? (
                <div className="flex items-center gap-2 text-sm text-riznica-green bg-green-50 rounded-xl px-4 py-3">
                  <Mail size={15} />
                  NFT сертификатот е испратен успешно!
                </div>
              ) : (
                <>
                  {!showNftForm ? (
                    <button onClick={() => setShowNftForm(true)} className="btn-secondary text-sm">
                      <Mail size={14} />
                      Испрати NFT на победникот
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="field-label">Име на победникот</label>
                        <input type="text" placeholder="пр. Марко Марковски"
                          value={winnerName} onChange={e => setWinnerName(e.target.value)}
                          className="field-input" />
                      </div>
                      <div>
                        <label className="field-label">Мејл на победникот</label>
                        <input type="email" placeholder="пр. marko@gmail.com"
                          value={winnerEmail} onChange={e => setWinnerEmail(e.target.value)}
                          className="field-input" />
                      </div>
                      {nftError && <p className="text-xs text-riznica-red">{nftError}</p>}
                      <div className="flex gap-2">
                        <button onClick={handleSendNFT}
                          disabled={nftSending || !winnerEmail || !winnerName}
                          className="btn-primary flex-1 text-sm">
                          {nftSending ? 'Испраќање…' : '✉ Испрати NFT'}
                        </button>
                        <button onClick={() => setShowNftForm(false)}
                          className="btn-secondary text-sm px-4">
                          Откажи
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

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