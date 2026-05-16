import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import AuctionCard from '../components/ui/AuctionCard'
import { useAuctions } from '../hooks/useAuctions'
import { CATEGORIES, SORT_OPTIONS } from '../lib/mockData'

export default function Home() {
  const { auctions } = useAuctions()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Сите')
  const [sort, setSort] = useState('ending')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let list = [...auctions]
    if (category !== 'Сите') list = list.filter(a => a.category === category)
    if (search) list = list.filter(a =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.description.toLowerCase().includes(search.toLowerCase())
    )
    if (sort === 'ending')   list.sort((a, b) => a.endsAt - b.endsAt)
    if (sort === 'bid_high') list.sort((a, b) => b.currentBid - a.currentBid)
    if (sort === 'bid_low')  list.sort((a, b) => a.currentBid - b.currentBid)
    if (sort === 'bids')     list.sort((a, b) => b.bids - a.bids)
    return list
  }, [auctions, search, category, sort])

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">

      {/* Hero */}
      <section className="py-12 sm:py-16 max-w-lg">
        <p className="section-eyebrow">Аукции на блокчејн</p>
        <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.05] text-ink mb-4">
          Секој предмет<br />
          <em className="italic text-gold">носи приказна.</em>
        </h1>
        <p className="text-sm sm:text-base font-light text-ink-soft leading-relaxed max-w-sm">
          Автентични рачно изработени предмети од Македонија.
          Секоја продажба верифицирана со NFT на Solana.
        </p>
      </section>

      {/* Search + filter row */}
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Пребарај предмети…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="field-input pl-9"
          />
        </div>

        {/* Sort — desktop only inline */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="hidden sm:block btn-outline pr-8 cursor-pointer"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Filter toggle — mobile */}
        <button
          onClick={() => setShowFilters(o => !o)}
          className={`sm:hidden btn-outline flex items-center gap-1.5
            ${showFilters ? 'bg-ink text-parchment border-ink' : ''}`}
        >
          <SlidersHorizontal size={14} />
          Филтри
        </button>
      </div>

      {/* Categories + mobile sort */}
      <div className={`${showFilters ? 'flex' : 'hidden sm:flex'} flex-col sm:flex-row gap-3 mb-6`}>
        {/* Category pills — scrollable on mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar flex-1">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex-shrink-0 text-xs px-3.5 py-1.5 rounded-full border transition-all
                ${category === c
                  ? 'bg-ink text-parchment border-ink'
                  : 'bg-parchment-2 text-ink-soft border-parchment-3 hover:bg-parchment-3'
                }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Sort — mobile only */}
        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="sm:hidden field-input"
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Results count */}
      <p className="font-mono text-xs text-ink-muted mb-5">
        {filtered.length} {filtered.length === 1 ? 'предмет' : 'предмети'}
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filtered.map(a => <AuctionCard key={a.id} auction={a} />)}
        </div>
      ) : (
        <div className="text-center py-24 text-ink-muted text-sm">
          Нема предмети за пребарувањето.
        </div>
      )}
    </main>
  )
}
