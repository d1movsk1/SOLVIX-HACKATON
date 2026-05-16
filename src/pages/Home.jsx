import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X, MapPin, TrendingUp, Clock } from 'lucide-react'
import { Link } from 'react-router-dom'
import AuctionCard from '../components/ui/AuctionCard'
import { useAuctions } from '../hooks/useAuctions'
import { ALL_CATEGORIES, SORT_OPTIONS, LOCATIONS } from '../lib/mockData'

// Додади "Сите" на почеток
const CATEGORIES = ['Сите', ...ALL_CATEGORIES]

const PRICE_RANGES = [
  { label: 'Сите цени', min: 0,   max: Infinity },
  { label: 'До 50 $',   min: 0,   max: 50       },
  { label: '50–200 $',  min: 50,  max: 200      },
  { label: '200–500 $', min: 200, max: 500      },
  { label: 'Над 500 $', min: 500, max: Infinity },
]

export default function Home() {
  const { auctions, loading, chainLoaded } = useAuctions()

  const [search, setSearch]               = useState('')
  const [category, setCategory]           = useState('Сите')
  const [sort, setSort]                   = useState('ending')
  const [showFilters, setShowFilters]     = useState(false)
  const [priceRange, setPriceRange]       = useState(0)       // индекс во PRICE_RANGES
  const [location, setLocation]           = useState('')
  const [onlyActive, setOnlyActive]       = useState(false)
  const [onlyEndingSoon, setOnlyEndingSoon] = useState(false)

  const activeCount = (category !== 'Сите' ? 1 : 0)
    + (priceRange !== 0 ? 1 : 0)
    + (location ? 1 : 0)
    + (onlyActive ? 1 : 0)
    + (onlyEndingSoon ? 1 : 0)

  function clearAll() {
    setCategory('Сите')
    setPriceRange(0)
    setLocation('')
    setOnlyActive(false)
    setOnlyEndingSoon(false)
    setSearch('')
  }

  const filtered = useMemo(() => {
    const { min, max } = PRICE_RANGES[priceRange]
    let list = [...auctions]

    if (category !== 'Сите')
      list = list.filter(a =>
        a.category === category ||
        a.categories?.includes(category)
      )
    if (search)
      list = list.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.description?.toLowerCase().includes(search.toLowerCase()) ||
        a.seller?.toLowerCase().includes(search.toLowerCase()) ||
        a.location?.toLowerCase().includes(search.toLowerCase())
      )
    if (priceRange !== 0)
      list = list.filter(a => a.currentBid >= min && a.currentBid <= max)
    if (location)
      list = list.filter(a => a.location === location)
    if (onlyActive)
      list = list.filter(a => !a.ended && a.endsAt > Date.now())
    if (onlyEndingSoon)
      list = list.filter(a => a.endsAt - Date.now() < 1000 * 60 * 60 * 6 && a.endsAt > Date.now())

    if (sort === 'ending')   list.sort((a, b) => a.endsAt - b.endsAt)
    if (sort === 'bid_high') list.sort((a, b) => b.currentBid - a.currentBid)
    if (sort === 'bid_low')  list.sort((a, b) => a.currentBid - b.currentBid)
    if (sort === 'bids')     list.sort((a, b) => b.bids - a.bids)
    return list
  }, [auctions, search, category, sort, priceRange, location, onlyActive, onlyEndingSoon])

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">

      {/* Hero */}
      <section className="py-10 sm:py-14 max-w-lg">
        <p className="section-eyebrow">Аукции на блокчејн</p>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.05] text-ink mb-4">
          Секој предмет<br />
          <em className="italic text-gold">носи приказна.</em>
        </h1>
        <p className="text-base font-light text-ink-soft leading-relaxed max-w-sm">
          Автентични рачно изработени предмети од Македонија.
          Секоја продажба верифицирана со дигитален сертификат.
        </p>
        {chainLoaded && (
          <p className="mt-3 text-sm text-riznica-green flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-riznica-green inline-block animate-pulse" />
            Live — вчитано од блокчејн
          </p>
        )}
      </section>

      {/* Search row */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Пребарај предмети, продавачи, локации…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="field-input pl-10"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1">
              <X size={14} />
            </button>
          )}
        </div>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="hidden sm:block btn-outline pr-8 cursor-pointer"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <button
          onClick={() => setShowFilters(o => !o)}
          className={`btn-outline flex items-center gap-1.5 relative
            ${showFilters ? 'bg-ink text-parchment border-ink' : ''}`}
        >
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Филтри</span>
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gold
                             text-ink text-xs font-bold flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Category pills — секогаш видливи */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-3">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`flex-shrink-0 text-sm px-4 py-1.5 rounded-full border transition-all
              ${category === c
                ? 'bg-ink text-parchment border-ink font-medium'
                : 'bg-parchment-2 text-ink-soft border-parchment-3 hover:bg-parchment-3'
              }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-white/60 backdrop-blur-sm border border-parchment-3 rounded-2xl p-5 mb-5 flex flex-col gap-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Ценовен опсег */}
            <div>
              <p className="field-label flex items-center gap-1.5">
                <TrendingUp size={13} /> Цена
              </p>
              <div className="flex flex-col gap-1.5">
                {PRICE_RANGES.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setPriceRange(i)}
                    className={`text-left text-sm px-3 py-2 rounded-lg border transition-all
                      ${priceRange === i
                        ? 'bg-ink text-parchment border-ink'
                        : 'bg-white/50 text-ink-soft border-parchment-3 hover:bg-parchment-2'
                      }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Локација */}
            <div>
              <p className="field-label flex items-center gap-1.5">
                <MapPin size={13} /> Локација
              </p>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setLocation('')}
                  className={`text-left text-sm px-3 py-2 rounded-lg border transition-all
                    ${!location
                      ? 'bg-ink text-parchment border-ink'
                      : 'bg-white/50 text-ink-soft border-parchment-3 hover:bg-parchment-2'
                    }`}
                >
                  Сите локации
                </button>
                {LOCATIONS.map(l => (
                  <button
                    key={l}
                    onClick={() => setLocation(l)}
                    className={`text-left text-sm px-3 py-2 rounded-lg border transition-all
                      ${location === l
                        ? 'bg-ink text-parchment border-ink'
                        : 'bg-white/50 text-ink-soft border-parchment-3 hover:bg-parchment-2'
                      }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Статус + Сортирање */}
            <div className="flex flex-col gap-4">
              <div>
                <p className="field-label flex items-center gap-1.5">
                  <Clock size={13} /> Статус
                </p>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div
                      onClick={() => setOnlyActive(o => !o)}
                      className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer
                        ${onlyActive ? 'bg-ink' : 'bg-parchment-3'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform
                        ${onlyActive ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm text-ink-soft">Само активни</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <div
                      onClick={() => setOnlyEndingSoon(o => !o)}
                      className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 cursor-pointer
                        ${onlyEndingSoon ? 'bg-riznica-red' : 'bg-parchment-3'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform
                        ${onlyEndingSoon ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                    <span className="text-sm text-ink-soft">Завршуваат наскоро</span>
                  </label>
                </div>
              </div>

              <div>
                <p className="field-label">Сортирај по</p>
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="field-input text-sm"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {activeCount > 0 && (
            <button
              onClick={clearAll}
              className="self-start flex items-center gap-1.5 text-sm text-riznica-red hover:underline"
            >
              <X size={13} /> Исчисти ги сите филтри
            </button>
          )}
        </div>
      )}

      {/* Активни филтер chips */}
      {activeCount > 0 && !showFilters && (
        <div className="flex flex-wrap gap-2 mb-4">
          {category !== 'Сите' && (
            <span className="flex items-center gap-1.5 text-sm bg-ink text-parchment px-3 py-1 rounded-full">
              {category}
              <button onClick={() => setCategory('Сите')}><X size={11} /></button>
            </span>
          )}
          {priceRange !== 0 && (
            <span className="flex items-center gap-1.5 text-sm bg-parchment-3 text-ink-soft px-3 py-1 rounded-full">
              {PRICE_RANGES[priceRange].label}
              <button onClick={() => setPriceRange(0)}><X size={11} /></button>
            </span>
          )}
          {location && (
            <span className="flex items-center gap-1.5 text-sm bg-parchment-3 text-ink-soft px-3 py-1 rounded-full">
              <MapPin size={11} />{location}
              <button onClick={() => setLocation('')}><X size={11} /></button>
            </span>
          )}
          {onlyActive && (
            <span className="flex items-center gap-1.5 text-sm bg-parchment-3 text-ink-soft px-3 py-1 rounded-full">
              Само активни
              <button onClick={() => setOnlyActive(false)}><X size={11} /></button>
            </span>
          )}
          {onlyEndingSoon && (
            <span className="flex items-center gap-1.5 text-sm bg-red-50 text-riznica-red px-3 py-1 rounded-full">
              Завршуваат наскоро
              <button onClick={() => setOnlyEndingSoon(false)}><X size={11} /></button>
            </span>
          )}
          <button onClick={clearAll} className="text-sm text-ink-muted hover:text-ink underline">
            Исчисти сè
          </button>
        </div>
      )}

      {/* Results */}
      {!loading && (
        <p className="text-sm text-ink-muted mb-5">
          {filtered.length} {filtered.length === 1 ? 'предмет' : 'предмети'}
          {activeCount > 0 && (
            <button onClick={clearAll} className="ml-2 text-gold-dim hover:underline text-sm">
              · Прикажи сите
            </button>
          )}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <div className="w-8 h-8 border-2 border-parchment-3 border-t-gold rounded-full animate-spin" />
          <p className="text-sm text-ink-muted">Вчитување…</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map(a => <AuctionCard key={a.id} auction={a} />)}
        </div>
      ) : (
        <div className="text-center py-24 flex flex-col items-center gap-4">
          <p className="text-lg text-ink-soft">Нема предмети за овие филтри.</p>
          <button onClick={clearAll} className="text-gold-dim hover:underline text-base">
            Прикажи ги сите предмети
          </button>
        </div>
      )}
    </main>
  )
}