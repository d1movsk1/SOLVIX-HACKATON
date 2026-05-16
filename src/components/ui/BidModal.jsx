import { useState } from 'react'
import { X, Wallet, ExternalLink, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react'
import { explorerUrl } from '../../lib/solana'

const STEPS = [
  { n: 1, label: 'Поврзи паричник'  },
  { n: 2, label: 'Постави понуда'   },
  { n: 3, label: 'Чекај завршување' },
  { n: 4, label: 'Добиј предметот'  },
]

export default function BidModal({ auction, onClose, onBid, connected, onConnect }) {
  const [amount, setAmount]   = useState(auction.currentBid + 5)
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)

  const minBid      = auction.currentBid + 1
  const phantom     = window.solana?.isPhantom ? window.solana : null
  const phantomReady = phantom?.isConnected
  const currentStep = (!connected || !phantomReady) ? 1 : result?.success ? 3 : 2

  async function handleBid() {
    if (amount < minBid) return

    // Поврзи Phantom ако не е поврзан
    if (phantom && !phantom.isConnected) {
      try {
        await phantom.connect()
      } catch {
        setResult({ success: false, error: 'Ја откажа поврзувањето со Phantom.' })
        return
      }
    }

    setLoading(true)
    const res = await onBid(auction.id, amount)
    setResult(res)
    setLoading(false)
  }

  function errorMessage(err) {
    if (!err) return 'Непозната грешка. Обиди се повторно.'
    if (err.includes('Инсталирај'))    return 'Инсталирај го Phantom паричникот од phantom.app'
    if (err.includes('поврзан'))       return 'Отвори го Phantom и поврзи се пред да понудиш.'
    if (err.includes('User rejected')) return 'Ја откажа трансакцијата. Обиди се повторно.'
    if (err.includes('insufficient'))  return 'Немаш доволно средства. Земи бесплатни USDC на faucet.circle.com'
    return err
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-parchment w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-modal relative max-h-[95vh] overflow-y-auto">

        <div className="sm:hidden w-12 h-1.5 bg-parchment-3 rounded-full mx-auto mt-4 mb-2" />

        {/* Header */}
        <div className="px-6 pt-4 pb-4 border-b border-parchment-2">
          <button onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-ink-muted hover:bg-parchment-2 transition-colors">
            <X size={20} />
          </button>
          <h2 className="font-display text-2xl font-semibold text-ink">Постави понуда</h2>
          <p className="text-sm text-ink-muted mt-0.5 pr-8">{auction.title}</p>
        </div>

        {/* Прогрес */}
        <div className="px-6 py-4 border-b border-parchment-2">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={s.n} className="flex items-center">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${s.n <= currentStep
                      ? 'bg-ink text-parchment'
                      : 'bg-parchment-2 text-ink-muted border border-parchment-3'}`}>
                    {s.n < currentStep ? '✓' : s.n}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block text-center leading-tight max-w-[60px]
                    ${s.n <= currentStep ? 'text-ink-soft' : 'text-ink-muted'}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 w-8 sm:w-12 mx-1 mb-4 sm:mb-5 rounded transition-all
                    ${s.n < currentStep ? 'bg-ink' : 'bg-parchment-3'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">

          {/* Success */}
          {result?.success && (
            <div className="flex flex-col items-center gap-5 py-4 text-center">
              <div className="w-20 h-20 rounded-full bg-riznica-green/10 flex items-center justify-center">
                <CheckCircle size={40} strokeWidth={1.5} className="text-riznica-green" />
              </div>
              <div>
                <p className="font-display text-2xl font-semibold mb-2">Понудата е поставена!</p>
                <p className="text-base text-ink-muted">
                  <strong className="text-ink">{amount} $</strong> се чуваат безбедно до крај на аукцијата.
                </p>
                <p className="text-sm text-ink-muted mt-1">
                  Ако некој понуди повеќе, парите автоматски се враќаат назад кај тебе.
                </p>
              </div>
              {result.signature && (
                <a href={explorerUrl(result.signature)} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-gold-dim hover:text-gold underline">
                  Погледни го доказот <ExternalLink size={13} />
                </a>
              )}
              <button onClick={onClose} className="btn-primary mt-2">Готово</button>
            </div>
          )}

          {/* Error */}
          {result && !result.success && (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 bg-red-50 border border-riznica-red/30 rounded-xl px-4 py-4">
                <AlertCircle size={20} className="text-riznica-red flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-riznica-red mb-1">Нешто тргна наопаку</p>
                  <p className="text-sm text-riznica-red/80">{errorMessage(result.error)}</p>
                </div>
              </div>
              <button onClick={() => setResult(null)} className="btn-primary">Обиди се повторно</button>
              <button onClick={onClose} className="text-sm text-ink-muted hover:text-ink text-center py-2">Откажи</button>
            </div>
          )}

          {/* Bid form */}
          {!result && (
            <>
              {/* Phantom не е инсталиран */}
              {!phantom && (
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
                  <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700">
                    За да понудиш треба <a href="https://phantom.app" target="_blank" rel="noopener noreferrer"
                      className="underline font-medium">Phantom паричник</a> инсталиран во прелистувачот.
                  </p>
                </div>
              )}

              {/* Тековна понуда */}
              <div className="flex items-center justify-between bg-parchment-2 rounded-xl px-5 py-4 mb-5">
                <span className="text-sm font-semibold text-ink-soft uppercase tracking-wide">Тековна понуда</span>
                <span className="font-display text-2xl font-bold">
                  {auction.currentBid} <span className="text-base font-normal text-ink-muted">$</span>
                </span>
              </div>

              {/* Сума */}
              <div className="mb-5">
                <label className="field-label">Твојата понуда (во американски долари)</label>
                <div className="flex items-center border-2 border-parchment-3 rounded-xl overflow-hidden bg-white focus-within:border-ink-soft transition-colors">
                  <button onClick={() => setAmount(a => Math.max(minBid, a - 5))}
                    className="px-5 h-14 bg-parchment-2 text-ink-soft text-2xl hover:bg-parchment-3 transition-colors flex-shrink-0 font-light">
                    −
                  </button>
                  <input type="number" value={amount} min={minBid}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="flex-1 h-14 text-center font-display text-3xl font-bold bg-transparent outline-none text-ink" />
                  <button onClick={() => setAmount(a => a + 5)}
                    className="px-5 h-14 bg-parchment-2 text-ink-soft text-2xl hover:bg-parchment-3 transition-colors flex-shrink-0 font-light">
                    +
                  </button>
                </div>
                {amount < minBid && <p className="error-msg mt-2">Минималната понуда е {minBid} $</p>}
              </div>

              {/* Резиме */}
              <div className="border border-parchment-3 rounded-xl divide-y divide-parchment-3 mb-5">
                {[
                  ['Понудуваш',       `${amount} $`],
                  ['Парите се чуваат','Безбедно до крај на аукцијата'],
                  ['Ако не победиш',  'Парите се враќаат автоматски'],
                  ['Ако победиш',     'Добиваш предмет + дигитален сертификат'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-3 text-sm">
                    <span className="text-ink-muted">{k}</span>
                    <span className="font-medium text-ink text-right max-w-[55%]">{v}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 mb-5 text-sm text-riznica-green bg-riznica-green/5 border border-riznica-green/20 rounded-xl px-4 py-3">
                <ShieldCheck size={16} className="flex-shrink-0" />
                <span>Твојата понуда е заштитена со блокчејн технологија</span>
              </div>

              {/* Копче */}
              {connected ? (
                <button
                  onClick={handleBid}
                  disabled={loading || amount < minBid || !phantom}
                  className="btn-primary mb-3 text-lg py-4"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <span className="w-5 h-5 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" />
                      Потпишување во Phantom…
                    </span>
                  ) : `Понуди ${amount} $`}
                </button>
              ) : (
                <button onClick={onConnect} className="btn-primary mb-3 text-lg py-4">
                  <Wallet size={18} />
                  Влези за да понудиш
                </button>
              )}

              <p className="text-center text-xs text-ink-muted">
                Ова е тест верзија · Нема вистински пари
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}