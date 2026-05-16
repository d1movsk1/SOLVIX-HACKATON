import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Upload, ArrowLeft, CheckCircle, Wallet } from 'lucide-react'
import { useWallet } from '../hooks/useWallet'
import { useAuctions } from '../hooks/useAuctions'
import { listItem, uploadImage } from '../lib/solana'

const CATEGORIES = ['Текстил', 'Антиквитети', 'Занаети', 'Фотографија', 'Народна носија', 'Друго']
const DURATIONS = [
  { label: '24 часа', hours: 24 },
  { label: '3 дена',  hours: 72 },
  { label: '7 дена',  hours: 168 },
]

const EMPTY = { title: '', description: '', category: 'Текстил', location: '', startingBid: '', duration: 72, image: null, imagePreview: null }

export default function Sell() {
  const { connected, connect } = useWallet()
  const { addAuction } = useAuctions()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [errors, setErrors] = useState({})

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    setErrors(e => ({ ...e, [key]: undefined }))
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
    if (!form.title.trim())        errs.title       = 'Внеси наслов'
    if (!form.description.trim())  errs.description = 'Внеси опис'
    if (!form.location.trim())     errs.location    = 'Внеси локација'
    if (!form.startingBid || Number(form.startingBid) < 1) errs.startingBid = 'Минимум 1 USDC'
    if (!form.image)               errs.image       = 'Прикачи слика'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const imageUri = await uploadImage(form.image)
      const result = await listItem({
        title: form.title, description: form.description,
        imageUri, startingBid: Number(form.startingBid), durationHours: form.duration,
      })
      addAuction({
        id: result.auctionId, title: form.title, description: form.description,
        seller: 'Ти', sellerWallet: '????...????',
        image: imageUri,
        currentBid: Number(form.startingBid), startingBid: Number(form.startingBid),
        currency: 'USDC', endsAt: Date.now() + form.duration * 3_600_000,
        bids: 0, category: form.category, location: form.location, nftMinted: false,
      })
      setDone(true)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /* ── Success screen ── */
  if (done) return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-5 px-4 text-center">
      <CheckCircle size={52} strokeWidth={1.5} className="text-riznica-green" />
      <div>
        <h1 className="font-display text-3xl font-medium mb-2">Предметот е листан!</h1>
        <p className="text-sm text-ink-soft leading-relaxed">
          Аукцијата е активна на Solana Devnet.<br />
          NFT ќе биде мintиран за победникот.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs mt-2">
        <button onClick={() => navigate('/')} className="btn-primary">Кон аукции</button>
        <button onClick={() => { setDone(false); setForm(EMPTY) }} className="btn-secondary">
          Листај нов
        </button>
      </div>
    </div>
  )

  /* ── Main form ── */
  return (
    <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 pb-20">

      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-6">
        <ArrowLeft size={15} />
        Назад
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-4xl font-medium mb-3">Постави предмет на аукција</h1>
        <p className="text-sm font-light text-ink-soft leading-relaxed">
          Твојот предмет ќе биде верифициран со NFT на Solana.
          Купувачите понудуваат во USDC, заклучен во escrow до крај.
        </p>
      </div>

      {!connected ? (
        <div className="flex flex-col items-center gap-4 py-16 border-2 border-dashed border-parchment-3 rounded-2xl text-center px-6">
          <p className="text-ink-soft text-sm">За да листаш предмет, поврзи го Phantom паричникот.</p>
          <button onClick={connect} className="btn-primary max-w-xs">
            <Wallet size={15} />
            Поврзи паричник
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Image upload */}
          <div>
            <label className="field-label">Слика *</label>
            <label className={`flex items-center justify-center border-2 border-dashed rounded-2xl
                               min-h-48 cursor-pointer transition-colors overflow-hidden relative
                               ${errors.image ? 'border-riznica-red' : 'border-parchment-3 hover:border-ink-soft hover:bg-parchment-2'}`}>
              {form.imagePreview ? (
                <img src={form.imagePreview} alt="preview" className="w-full h-56 object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-ink-muted py-8">
                  <Upload size={28} strokeWidth={1.5} />
                  <span className="text-sm">Кликни или повлечи слика</span>
                  <span className="text-xs">JPG, PNG, WEBP · max 10MB</span>
                </div>
              )}
              <input type="file" accept="image/*" onChange={handleImage} className="absolute inset-0 opacity-0 cursor-pointer" />
            </label>
            {errors.image && <p className="error-msg">{errors.image}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="field-label" htmlFor="title">Наслов *</label>
            <input
              id="title" type="text"
              placeholder="пр. Бабина шарена торба"
              value={form.title}
              onChange={e => set('title', e.target.value)}
              className={`field-input ${errors.title ? 'field-error' : ''}`}
            />
            {errors.title && <p className="error-msg">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="field-label" htmlFor="desc">Опис *</label>
            <textarea
              id="desc"
              placeholder="Раскажи ја приказната — откаде потекнува, кој го направил, зошто е посебен…"
              value={form.description}
              onChange={e => set('description', e.target.value)}
              rows={5}
              className={`field-input resize-none ${errors.description ? 'field-error' : ''}`}
            />
            {errors.description && <p className="error-msg">{errors.description}</p>}
          </div>

          {/* Category + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="cat">Категорија</label>
              <select id="cat" value={form.category} onChange={e => set('category', e.target.value)} className="field-input">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label" htmlFor="loc">Локација *</label>
              <input
                id="loc" type="text" placeholder="пр. Скопје"
                value={form.location}
                onChange={e => set('location', e.target.value)}
                className={`field-input ${errors.location ? 'field-error' : ''}`}
              />
              {errors.location && <p className="error-msg">{errors.location}</p>}
            </div>
          </div>

          {/* Starting bid + Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="field-label" htmlFor="bid">Почетна цена (USDC) *</label>
              <div className="relative">
                <input
                  id="bid" type="number" min="0" placeholder="0"
                  value={form.startingBid}
                  onChange={e => set('startingBid', e.target.value)}
                  className={`field-input pr-16 ${errors.startingBid ? 'field-error' : ''}`}
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 font-mono text-xs text-ink-muted pointer-events-none">
                  USDC
                </span>
              </div>
              {errors.startingBid && <p className="error-msg">{errors.startingBid}</p>}
            </div>

            <div>
              <label className="field-label">Траење</label>
              <div className="flex gap-2">
                {DURATIONS.map(d => (
                  <button
                    key={d.hours} type="button"
                    onClick={() => set('duration', d.hours)}
                    className={`flex-1 py-3 text-xs rounded-xl border transition-all
                      ${form.duration === d.hours
                        ? 'bg-ink text-parchment border-ink'
                        : 'bg-parchment-2 text-ink-soft border-parchment-3 hover:bg-parchment-3'
                      }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-parchment-2 rounded-xl divide-y divide-parchment-3 text-sm">
            {[
              ['Почетна цена',       `${form.startingBid || '—'} USDC`],
              ['Провизија',          '0% (хакатон)'],
              ['NFT Royalties',      '5% на секоја препродажба'],
              ['Мрежа',              'Solana Devnet'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between px-4 py-3 text-ink-soft">
                <span>{k}</span>
                <span className="font-medium text-ink">{v}</span>
              </div>
            ))}
          </div>

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Објавување…' : 'Постави на аукција'}
          </button>
        </form>
      )}
    </main>
  )
}
