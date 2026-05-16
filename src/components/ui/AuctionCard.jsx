import { Link } from 'react-router-dom'
import { MapPin, Users } from 'lucide-react'
import Countdown from './Countdown'

export default function AuctionCard({ auction }) {
  const { id, title, image, currentBid, currency, endsAt, bids, categories, category, location, seller } = auction
  const cats = categories || (category ? [category] : [])
  const isEndingSoon = endsAt - Date.now() < 1000 * 60 * 60 * 6

  return (
    <Link to={`/auction/${id}`} className="card-base flex flex-col group cursor-pointer">
      <div className="relative aspect-[4/3] overflow-hidden bg-parchment-2">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Category pills */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[70%]">
          {cats.slice(0, 2).map(c => (
            <span key={c} className="tag bg-parchment/85 backdrop-blur-sm text-ink">{c}</span>
          ))}
          {cats.length > 2 && (
            <span className="tag bg-parchment/85 backdrop-blur-sm text-ink">+{cats.length - 2}</span>
          )}
        </div>
        {isEndingSoon && (
          <span className="absolute top-3 right-3 tag bg-riznica-red text-white animate-pulse">
            Завршува наскоро
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5 p-4 flex-1">
        <p className="flex items-center gap-1 text-xs text-ink-muted">
          {seller}
          <span className="mx-1 text-parchment-3">·</span>
          <MapPin size={10} />
          {location}
        </p>
        <h3 className="font-display text-lg font-medium leading-snug text-ink line-clamp-2">{title}</h3>

        <div className="mt-auto pt-3 border-t border-parchment-2 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-muted mb-0.5">Тековна понуда</p>
            <p className="font-display text-2xl font-semibold leading-none">
              {currentBid}
              <span className="font-body text-sm font-light text-ink-muted ml-1">{currency}</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span className="flex items-center gap-1 text-xs text-ink-muted">
              <Users size={11} />{bids} понуди
            </span>
            <Countdown
              endsAt={endsAt}
              className={`font-mono text-xs px-2 py-1 rounded-full
                ${isEndingSoon ? 'bg-red-50 text-riznica-red' : 'bg-parchment-2 text-ink-soft'}`}
            />
          </div>
        </div>
      </div>
    </Link>
  )
}
