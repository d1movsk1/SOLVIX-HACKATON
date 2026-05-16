import { useState } from 'react'
import { X, Wallet, ExternalLink, CheckCircle } from 'lucide-react'
import { explorerUrl } from '../../lib/solana'

export default function BidModal({ auction, onClose, onBid, connected, onConnect }) {
  const [amount, setAmount] = useState(auction.currentBid + 5)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const minBid = auction.currentBid + 1

  async function handleBid() {
  if (amount < minBid) return
  setLoading(true)
  const res = await onBid(auction.id, amount)
  setResult(res)
  setLoading(false)
}

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-parchment w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-modal p-6 sm:p-8 relative max-h-[95vh] overflow-y-auto">

        {/* Drag handle (mobile) */}
        <div className="sm:hidden w-10 h-1 bg-parchment-3 rounded-full mx-auto mb-5" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-ink-muted hover:bg-parchment-2 transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="font-display text-2xl font-medium mb-1">Постави понуда</h2>
        <p className="text-sm text-ink-muted mb-6 truncate">{auction.title}</p>

        {result ? (
          /* Success */
          <div className="flex flex-col items-center gap-4 py-4 text-center">
            <div className="w-16 h-16 rounded-full bg-riznica-green/10 flex items-center justify-center">
              <CheckCircle size={32} strokeWidth={1.5} className="text-riznica-green" />
            </div>
            <div>
              <p className="font-display text-xl font-medium mb-1">Понудата е поставена!</p>
              <p className="text-sm text-ink-muted">{amount} USDC заклучени во escrow</p>
            </div>
            {result.signature && (
              <a
                href={explorerUrl(result.signature)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-mono text-xs text-gold-dim hover:text-gold underline"
              >
                Погледни на Explorer <ExternalLink size={11} />
              </a>
            )}
            <button onClick={onClose} className="btn-primary mt-2">Затвори</button>
          </div>
        ) : (
          <>
            {/* Current bid */}
            <div className="flex items-center justify-between bg-parchment-2 rounded-xl px-4 py-3 mb-5">
              <span className="text-xs text-ink-muted uppercase tracking-widest">Тековна понуда</span>
              <span className="font-display text-xl font-semibold">{auction.currentBid} USDC</span>
            </div>

            {/* Amount picker */}
            <div className="mb-5">
              <label className="field-label">Твојата понуда (USDC)</label>
              <div className="flex items-center border border-parchment-3 rounded-xl overflow-hidden bg-white">
                <button
                  onClick={() => setAmount(a => Math.max(minBid, a - 5))}
                  className="px-4 h-12 bg-parchment-2 text-ink-soft text-lg hover:bg-parchment-3 transition-colors flex-shrink-0"
                >
                  −
                </button>
                <input
                  type="number"
                  value={amount}
                  min={minBid}
                  onChange={e => setAmount(Number(e.target.value))}
                  className="flex-1 h-12 text-center font-display text-2xl font-medium bg-transparent outline-none text-ink"
                />
                <button
                  onClick={() => setAmount(a => a + 5)}
                  className="px-4 h-12 bg-parchment-2 text-ink-soft text-lg hover:bg-parchment-3 transition-colors flex-shrink-0"
                >
                  +
                </button>
              </div>
              {amount < minBid && (
                <p className="error-msg">Минимална понуда: {minBid} USDC</p>
              )}
            </div>

            {/* Summary */}
            <div className="border border-parchment-3 rounded-xl divide-y divide-parchment-3 mb-5 text-sm">
              {[
                ['Понудуваш', `${amount} USDC`],
                ['Escrow', 'Заклучено до крај на аукција'],
                ['NFT', 'Мintира за победникот'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between px-4 py-2.5 text-ink-soft">
                  <span>{k}</span>
                  <span className="font-medium text-ink">{v}</span>
                </div>
              ))}
            </div>

            {connected ? (
              <button
                onClick={handleBid}
                disabled={loading || amount < minBid}
                className="btn-primary mb-3"
              >
                {loading ? 'Потпишување…' : `Понуди ${amount} USDC`}
              </button>
            ) : (
              <button onClick={onConnect} className="btn-secondary mb-3">
                <Wallet size={15} />
                Поврзи паричник за да понудиш
              </button>
            )}

            <p className="text-center font-mono text-xs text-ink-muted">
              Девнет — нема вистинска вредност
            </p>
          </>
        )}
      </div>
    </div>
  )
}
