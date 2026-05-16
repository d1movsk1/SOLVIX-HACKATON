import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Upload, ArrowLeft, CheckCircle, X, ExternalLink, AlertCircle } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'
import { useAuctions } from '../hooks/useAuctions'
import { listItem, uploadImage, explorerUrl, shortenAddress } from '../lib/solana'
import { ALL_CATEGORIES, LOCATIONS } from '../lib/mockData'

const DURATIONS = [
  { label: '24 часа', hours: 24  },
  { label: '3 дена',  hours: 72  },
  { label: '7 дена',  hours: 168 },
]

const EMPTY = {
  title: '', description: '', categories: [], location: '',
  startingBid: '', duration: 72, image: null, imagePreview: null,
}

export default function Sell() {
  const { authenticated, user } = usePrivy()
  const { addAuction }          = useAuctions()
  const navigate                = useNavigate()

  // Phantom за трансакции
  const phantom     = window.solana?.isPhantom ? window.solana : null
  const walletReady = authenticated && !!phantom

  const [form, setForm]               = useState(EMPTY)
  const [loading, setLoading]         = useState(false)
  const [done, setDone]               = useState(null)
  const [errors, setErrors]           = useState({})
  const [submitError, setSubmitError] = useState(null)

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
  }

  const toggleCategory = (c) => {
    setForm(f => ({
      ...f,
      categories: f.categories.includes(c)
        ? f.categories.filter(x => x !== c)
        : [...f.categories, c],
    }))
    setErrors(e => ({ ...e, categories: undefined }))
  }

  function handleImage(e) {
    const file = e.target.files[0]
    if (!file) return
    set('image', file)
    const reader = new FileReader()
    reader.onload = ev => set('imagePreview', ev.target.result)
    reader.readAsDataURL(file)
  }

  function validate() {
    const errs = {}
    if (!form.title.trim())           errs.title       = 'Внеси наслов'
    if (!form.description.trim())     errs.description = 'Внеси опис'
    if (!form.location)               errs.location    = 'Избери локација'
    if (form.categories.length === 0) errs.categories  = 'Избери барем една категорија'
    if (!form.startingBid || Number(form.startingBid) < 1) errs.startingBid = 'Минимум 1 $'
    if (!form.image)                  errs.image       = 'Прикачи слика'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    if (!phantom) {
      setSubmitError('Инсталирај го Phantom паричникот за да листаш предмет.')
      return
    }

    setLoading(true)
    setSubmitError(null)

    try {
      // Поврзи Phantom ако не е поврзан
      if (!phantom.isConnected) {
        await phantom.connect()
      }

      const pubkey   = phantom.publicKey?.toString() || ''
      const imageUri = await uploadImage(form.image)

      // Phantom wallet адаптер за solana.js
      const walletAdapter = {
        publicKey:           phantom.publicKey,
        signTransaction:     (tx) => phantom.signTransaction(tx),
        signAllTransactions: (txs) => phantom.signAllTransactions(txs),
      }

      const result = await listItem({
        title:         form.title,
        description:   form.description,
        imageUri,
        startingBid:   Number(form.startingBid),
        durationHours: form.duration,
        wallet:        walletAdapter,
      })

      addAuction({
        id:            result.auctionId,
        title:         form.title,
        description:   form.description,
        seller:        user?.google?.name || shortenAddress(pubkey),
        sellerWallet:  pubkey,
        sellerEmail:   user?.email?.address || user?.google?.email || '',
        image:         imageUri,
        currentBid:    Number(form.startingBid),
        startingBid:   Number(form.startingBid),
        currency:      'USDC',
        endsAt:        Date.now() + form.duration * 3_600_000,
        bids:          0,
        categories:    form.categories,
        location:      form.location,
        nftMinted:     false,
        currentBidder: null,
      })

      setDone(result)
    } catch (err) {
      console.error('listItem error:', err)
      if (err.message?.includes('User rejected'))
        setSubmitError('Ја откажа трансакцијата.')
      else if (err.message?.includes('insufficient'))
        setSubmitError('Немаш доволно SOL за gas.')
      else
        setSubmitError(err.message || 'Грешка при објавување.')
    } finally {
      setLoading(false)
    }
  }

  // Success screen
  if (done) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-5 px-4 text-center">
      <CheckCircle size={52} strokeWidth={1.5} className="text-riznica-green" />
      <div>
        <h1 className="font-display text-3xl font-medium mb-2">Предметот е листан!</h1>
        <p className="text-base text-ink-soft leading-relaxed">
          Аукцијата е зачувана засекогаш.<br />
          Дигиталниот сертификат ќе биде издаден за победникот.
        </p>
      </div>
      {done.signature && (
        <a href={explorerUrl(done.signature)} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-gold-dim hover:text-gold underline">
          Погледни доказ за трансакцијата <ExternalLink size={11} />
        </a>
      )}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mt-2">
        <button onClick={() => navigate('/')} className="btn-primary">Кон аукции</button>
        <button onClick={() => { setDone(null); setForm(EMPTY) }} className="btn-secondary">
          Листај нов
        </button>
      </div>
    </div>
  )

  // Не е логиран
  if (!authenticated) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4 text-center">
      <p className="text-lg text-ink-soft">Мораш да бидеш најавен за да листаш предмет.</p>
      <Link to="/login" className="btn-primary max-w-xs">Влези во Ризница</Link>
    </div>
  )

  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-20">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-6">
        <ArrowLeft size={15} /> Назад
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-4xl font-medium mb-3">Постави продукт</h1>
        <p className="text-base font-light text-ink-soft leading-relaxed">
          Твојот продукт ќе биде зачуван засекогаш.
          Купувачите нудат, а парите се чуваат безбедно до крај на аукцијата.
        </p>
        {!phantom && (
          <div className="mt-3 flex items-center gap-2 text-sm text-riznica-red bg-red-50 border border-riznica-red/20 rounded-xl px-4 py-3">
            <AlertCircle size={15} />
            Инсталирај го <a href="https://phantom.app" target="_blank" rel="noopener noreferrer" className="underline font-medium">Phantom</a> за да листаш предмети.
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Image */}
        <div>
          <label className="field-label">Слика *</label>
          <label className={`flex items-center justify-center border-2 border-dashed rounded-2xl
                             min-h-48 cursor-pointer transition-colors overflow-hidden relative
                             ${errors.image ? 'border-riznica-red' : 'border-parchment-3 hover:border-ink-soft hover:bg-white/40'}`}>
            {form.imagePreview
              ? <img src={form.imagePreview} alt="preview" className="w-full h-56 object-cover" />
              : (
                <div className="flex flex-col items-center gap-2 text-ink-muted py-8">
                  <Upload size={28} strokeWidth={1.5} />
                  <span className="text-base">Кликни или повлечи слика</span>
                  <span className="text-sm">JPG, PNG, WEBP · max 10MB</span>
                </div>
              )
            }
            <input type="file" accept="image/*" onChange={handleImage} className="absolute inset-0 opacity-0 cursor-pointer" />
          </label>
          {errors.image && <p className="error-msg">{errors.image}</p>}
        </div>

        {/* Title */}
        <div>
          <label className="field-label" htmlFor="title">Наслов *</label>
          <input id="title" type="text" placeholder="пр. Бабина шарена торба"
            value={form.title} onChange={e => set('title', e.target.value)}
            className={`field-input ${errors.title ? 'field-error' : ''}`} />
          {errors.title && <p className="error-msg">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="field-label" htmlFor="desc">Опис *</label>
          <textarea id="desc" rows={5}
            placeholder="Раскажи ја приказната — откаде потекнува, кој го направил, зошто е посебен…"
            value={form.description} onChange={e => set('description', e.target.value)}
            className={`field-input resize-none ${errors.description ? 'field-error' : ''}`} />
          {errors.description && <p className="error-msg">{errors.description}</p>}
        </div>

        {/* Categories */}
        <div>
          <label className="field-label">
            Категории *{' '}
            <span className="normal-case tracking-normal font-normal text-ink-muted">(може повеќе)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {ALL_CATEGORIES.map(c => (
              <button key={c} type="button" onClick={() => toggleCategory(c)}
                className={`flex items-center gap-1.5 text-sm px-3.5 py-2 rounded-xl border transition-all
                  ${form.categories.includes(c)
                    ? 'bg-ink text-parchment border-ink'
                    : 'bg-white/60 text-ink-soft border-parchment-3 hover:bg-parchment-2'
                  }`}>
                {form.categories.includes(c) && <X size={10} />}
                {c}
              </button>
            ))}
          </div>
          {form.categories.length > 0 && (
            <p className="text-sm text-ink-muted mt-1.5">Избрано: {form.categories.join(', ')}</p>
          )}
          {errors.categories && <p className="error-msg">{errors.categories}</p>}
        </div>

        {/* Location */}
        <div>
          <label className="field-label" htmlFor="loc">Локација *</label>
          <select id="loc" value={form.location} onChange={e => set('location', e.target.value)}
            className={`field-input ${errors.location ? 'field-error' : ''}`}>
            <option value="">Избери локација</option>
            {LOCATIONS.map(l => <option key={l}>{l}</option>)}
          </select>
          {errors.location && <p className="error-msg">{errors.location}</p>}
        </div>

        {/* Starting bid + Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="bid">Почетна цена ($) *</label>
            <div className="relative">
              <input id="bid" type="number" min="1" placeholder="0"
                value={form.startingBid} onChange={e => set('startingBid', e.target.value)}
                className={`field-input pr-10 ${errors.startingBid ? 'field-error' : ''}`} />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">$</span>
            </div>
            {errors.startingBid && <p className="error-msg">{errors.startingBid}</p>}
          </div>
          <div>
            <label className="field-label">Траење</label>
            <div className="flex gap-2">
              {DURATIONS.map(d => (
                <button key={d.hours} type="button" onClick={() => set('duration', d.hours)}
                  className={`flex-1 py-3 text-sm rounded-xl border transition-all
                    ${form.duration === d.hours
                      ? 'bg-ink text-parchment border-ink'
                      : 'bg-white/60 text-ink-soft border-parchment-3 hover:bg-parchment-2'
                    }`}>
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white/50 rounded-xl divide-y divide-parchment-3 text-sm">
          {[
            ['Почетна цена',         `${form.startingBid || '—'} $`],
            ['Категории',            form.categories.length > 0 ? form.categories.join(', ') : '—'],
            ['Провизија',            '2%'],
            ['Дигитален сертификат', '5% на секоја препродажба'],
            ['Зачувано на',          'Solana блокчејн'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between px-4 py-3 text-ink-soft">
              <span>{k}</span>
              <span className="font-medium text-ink text-right max-w-[60%]">{v}</span>
            </div>
          ))}
        </div>

        {submitError && (
          <div className="flex items-start gap-3 bg-red-50 border border-riznica-red/30 rounded-xl px-4 py-3">
            <AlertCircle size={16} className="text-riznica-red flex-shrink-0 mt-0.5" />
            <p className="text-sm text-riznica-red">{submitError}</p>
          </div>
        )}

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-parchment/30 border-t-parchment rounded-full animate-spin" />
              Објавување…
            </span>
          ) : 'Објави'}
        </button>

      </form>
    </main>
  )
}