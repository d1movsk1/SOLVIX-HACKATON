import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Plus, Archive, Menu, X, User, LogOut, LogIn } from 'lucide-react'
import { usePrivy } from '@privy-io/react-auth'

export default function Navbar() {
  const { authenticated, logout, user } = usePrivy()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  // Прикажи email или Google name
  const displayName = user?.google?.name
    || user?.email?.address?.split('@')[0]
    || 'Корисник'

  const navLink = (to, label, Icon) => {
    const active = pathname === to
    return (
      <Link
        to={to}
        onClick={() => setMenuOpen(false)}
        className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors
          ${active
            ? 'bg-parchment-3 text-ink font-semibold'
            : 'text-ink-muted hover:text-ink hover:bg-parchment-2'
          }`}
      >
        <Icon size={14} />
        {label}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-50 bg-parchment/90 backdrop-blur-md border-b border-parchment-3">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center">

        {/* Logo */}
        <Link to="/" className="flex-shrink-0 mr-6">
          <span className="font-display text-2xl font-semibold tracking-tight text-ink">Ризница</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden sm:flex items-center gap-1">
          {navLink('/', 'Аукции', Archive)}
          {authenticated && navLink('/sell', 'Листај', Plus)}
          {authenticated && navLink('/my-auctions', 'Мои аукции', User)}
        </nav>

        {/* Десна страна */}
        <div className="hidden sm:block ml-auto">
          {authenticated ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-parchment-2 border border-parchment-3 rounded-xl px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-riznica-green flex-shrink-0" />
                <span className="text-sm text-ink-soft font-medium">{displayName}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-riznica-red
                           px-3 py-1.5 rounded-xl hover:bg-parchment-2 transition-colors"
              >
                <LogOut size={14} />
                Излез
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 text-sm font-semibold bg-ink text-parchment
                         px-4 py-2 rounded-xl hover:opacity-85 transition-opacity"
            >
              <LogIn size={14} />
              Влези
            </button>
          )}
        </div>

        {/* Hamburger — mobile */}
        <button
          className="sm:hidden ml-auto p-2 rounded-lg text-ink-muted hover:bg-parchment-2 transition-colors"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Мени"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="sm:hidden border-t border-parchment-3 bg-parchment px-4 py-4 flex flex-col gap-2">
          {navLink('/', 'Аукции', Archive)}
          {authenticated && navLink('/sell', 'Листај', Plus)}
          {authenticated && navLink('/my-auctions', 'Мои аукции', User)}

          <div className="mt-2 pt-3 border-t border-parchment-3">
            {authenticated ? (
              <div className="flex items-center justify-between bg-parchment-2 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-riznica-green" />
                  <span className="text-sm text-ink-soft font-medium">{displayName}</span>
                </div>
                <button
                  onClick={() => { logout(); setMenuOpen(false) }}
                  className="text-sm text-ink-muted hover:text-riznica-red flex items-center gap-1"
                >
                  <LogOut size={13} /> Излез
                </button>
              </div>
            ) : (
              <button
                onClick={() => { navigate('/login'); setMenuOpen(false) }}
                className="btn-primary"
              >
                <LogIn size={15} />
                Влези во Ризница
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}