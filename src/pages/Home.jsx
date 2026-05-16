import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, SlidersHorizontal, X, MapPin, TrendingUp, Clock, Tag } from 'lucide-react'
import AuctionCard from '../components/ui/AuctionCard'
import { useAuctions } from '../hooks/useAuctions'
import { ALL_CATEGORIES, SORT_OPTIONS, LOCATIONS } from '../lib/mockData'

export default function Home() {
  const { auctions, chainLoaded, loading } = useAuctions()
  const [search, setSearch]                = useState('')
  const [categories, setCategories]        = useState([])
  const [sort, setSort]                    = useState('ending')
  const [showFilters, setShowFilters]      = useState(false)
  const [location, setLocation]            = useState('')
  const [priceMin, setPriceMin]            = useState('')
  const [priceMax, setPriceMax]            = useState('')
  const [onlyActive, setOnlyActive]        = useState(false)
  const [onlyEndingSoon, setOnlyEndingSoon] = useState(false)

  const toggleCategory = (c) =>
    setCategories(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c])

  const clearFilters = () => {
    setCategories([]); setLocation(''); setPriceMin(''); setPriceMax('')
    setOnlyActive(false); setOnlyEndingSoon(false); setSearch('')
  }

  const activeFilterCount = categories.length
    + (location ? 1 : 0)
    + (priceMin ? 1 : 0)
    + (priceMax ? 1 : 0)
    + (onlyActive ? 1 : 0)
    + (onlyEndingSoon ? 1 : 0)

  const filtered = useMemo(() => {
    let list = [...auctions]
    if (categories.length > 0)
      list = list.filter(a => a.categories?.some(c => categories.includes(c)))
    if (search)
      list = list.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.description.toLowerCase().includes(search.toLowerCase()) ||
        a.seller?.toLowerCase().includes(search.toLowerCase())
      )
    if (location)   list = list.filter(a => a.location === location)
    if (priceMin)   list = list.filter(a => a.currentBid >= Number(priceMin))
    if (priceMax)   list = list.filter(a => a.currentBid <= Number(priceMax))
    if (onlyActive) list = list.filter(a => !a.ended && a.endsAt > Date.now())
    if (onlyEndingSoon)
      list = list.filter(a => a.endsAt - Date.now() < 1000 * 60 * 60 * 6 && a.endsAt > Date.now())

    if (sort === 'ending')   list.sort((a, b) => a.endsAt - b.endsAt)
    if (sort === 'bid_high') list.sort((a, b) => b.currentBid - a.currentBid)
    if (sort === 'bid_low')  list.sort((a, b) => a.currentBid - b.currentBid)
    if (sort === 'bids')     list.sort((a, b) => b.bids - a.bids)
    if (sort === 'newest')   list.sort((a, b) => b.endsAt - a.endsAt)
    return list
  }, [auctions, search, categories, sort, location, priceMin, priceMax, onlyActive, onlyEndingSoon])

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">

      {/* Hero */}
      <section className="py-10 sm:py-14 max-w-lg">
        <p className="section-eyebrow">Аукции на блокчејн</p>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.05] text-ink mb-4">
          Секој предмет<br />
          <em className="italic text-gold">носи приказна.</em>
        </h1>
        <p className="text-sm sm:text-base font-light text-ink-soft leading-relaxed max-w-sm">
          Автентични рачно изработени предмети од Македонија.
          Секоја продажба верифицирана со NFT на Solana.
        </p>
        {chainLoaded && (
          <p className="mt-3 font-mono text-xs text-riznica-green flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-riznica-green inline-block animate-pulse" />
            Live — вчитано од Solana Devnet
          </p>
        )}
      </section>

      {/* Search + filter toggle */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Пребарај предмети, продавачи…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="field-input pl-9"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="hidden sm:block btn-outline pr-8 cursor-pointer"
        >
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>

        <button
          onClick={() => setShowFilters(o => !o)}
          className={`btn-outline flex items-center gap-1.5 relative
            ${showFilters ? 'bg-ink text-parchment border-ink' : ''}`}
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Филтри</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-gold text-ink text-[10px] font-mono flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white/60 backdrop-blur-sm border border-parchment-3 rounded-2xl p-4 sm:p-5 mb-5 flex flex-col gap-5">
          <div>
            <p className="field-label flex items-center gap-1.5"><Tag size={12} /> Категории</p>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map(c => (
                <button
                  key={c}
                  onClick={() => toggleCategory(c)}
                  className={`text-xs px-3.5 py-1.5 rounded-full border transition-all
                    ${categories.includes(c)
                      ? 'bg-ink text-parchment border-ink'
                      : 'bg-parchment-2 text-ink-soft border-parchment-3 hover:bg-parchment-3'
                    }`}
                >
                  {categories.includes(c) && <span className="mr-1">✓</span>}
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="field-label flex items-center gap-1.5"><MapPin size={12} /> Локација</p>
              <select value={location} onChange={e => setLocation(e.target.value)} className="field-input">
                <option value="">Сите локации</option>
                {LOCATIONS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>

            <div>
              <p className="field-label flex items-center gap-1.5"><TrendingUp size={12} /> Цена (USDC)</p>
              <div className="flex gap-2">
                <input type="number" placeholder="Мин" min="0" value={priceMin}
                  onChange={e => setPriceMin(e.target.value)} className="field-input" />
                <input type="number" placeholder="Макс" min="0" value={priceMax}
                  onChange={e => setPriceMax(e.target.value)} className="field-input" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div>
                <p className="field-label flex items-center gap-1.5"><Clock size={12} /> Сортирај</p>
                <select value={sort} onChange={e => setSort(e.target.value)} className="field-input">
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-ink-soft">
                  <input type="checkbox" checked={onlyActive} onChange={e => setOnlyActive(e.target.checked)}
                    className="rounded border-parchment-3" />
                  Само активни
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-ink-soft">
                  <input type="checkbox" checked={onlyEndingSoon} onChange={e => setOnlyEndingSoon(e.target.checked)}
                    className="rounded border-parchment-3" />
                  Завршуваат во 6ч
                </label>
              </div>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="self-start text-xs text-riznica-red hover:underline flex items-center gap-1">
              <X size={11} /> Исчисти ги сите филтри
            </button>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {activeFilterCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(c => (
            <span key={c} className="flex items-center gap-1 text-xs bg-ink text-parchment px-2.5 py-1 rounded-full">
              {c} <button onClick={() => toggleCategory(c)}><X size={10} /></button>
            </span>
          ))}
          {location && (
            <span className="flex items-center gap-1 text-xs bg-parchment-3 text-ink-soft px-2.5 py-1 rounded-full">
              <MapPin size={10} />{location}
              <button onClick={() => setLocation('')}><X size={10} /></button>
            </span>
          )}
          {(priceMin || priceMax) && (
            <span className="flex items-center gap-1 text-xs bg-parchment-3 text-ink-soft px-2.5 py-1 rounded-full">
              {priceMin || '0'}–{priceMax || '∞'} USDC
              <button onClick={() => { setPriceMin(''); setPriceMax('') }}><X size={10} /></button>
            </span>
          )}
        </div>
      )}

      {/* Results count */}
      {!loading && (
        <p className="font-mono text-xs text-ink-muted mb-5">
          {filtered.length} {filtered.length === 1 ? 'предмет' : 'предмети'}
        </p>
      )}

      {/* Grid / Loading / Empty */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-8 h-8 border-2 border-parchment-3 border-t-gold rounded-full animate-spin" />
          <p className="font-mono text-xs text-ink-muted">Вчитување од Solana Devnet…</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map(a => <AuctionCard key={a.id} auction={a} />)}
        </div>
      ) : (
        <div className="text-center py-24 text-ink-muted text-sm flex flex-col items-center gap-3">
          {chainLoaded && auctions.length === 0 ? (
            <>
              <p className="font-display text-2xl text-ink-soft">Сè уште нема аукции.</p>
              <p className="text-sm">Биди прв и листај предмет на блокчејнот.</p>
              <Link to="/sell"
                className="mt-2 px-6 py-2.5 bg-ink text-parchment rounded-xl text-sm font-medium hover:opacity-85 transition-opacity">
                Листај предмет
              </Link>
            </>
          ) : (
            <>
              <p>Нема предмети за овие филтри.</p>
              <button onClick={clearFilters} className="text-gold-dim hover:underline text-xs">
                Исчисти ги филтрите
              </button>
            </>
          )}
        </div>
      )}
    </main>
  )
}
