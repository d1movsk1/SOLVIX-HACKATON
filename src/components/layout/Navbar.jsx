import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Wallet, Plus, Archive, Menu, X, User } from 'lucide-react'
import { useWallet } from '@solana/wallet-adapter-react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'

export default function Navbar() {
  const { connected, publicKey, disconnect } = useWallet()
  const { setVisible } = useWalletModal()
  const { pathname } = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const shortKey = publicKey
    ? publicKey.toString().slice(0, 4) + '...' + publicKey.toString().slice(-4)
    : ''

  const navLink = (to, label, Icon) => {
    const active = pathname === to
    return (
      <Link
        to={to}
        onClick={() => setMenuOpen(false)}
        className={`flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg transition-colors
          ${active
            ? 'bg-parchment-3 text-ink font-medium'
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">

        <Link to="/" className="flex items-baseline gap-2 flex-shrink-0">
          <span className="font-display text-2xl font-semibold tracking-tight text-ink">Ризница</span>
          <span className="devnet-badge">devnet</span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1 flex-1">
          {navLink('/', 'Аукции', Archive)}
          {navLink('/sell', 'Листај', Plus)}
          {connected && navLink('/my-auctions', 'Мои аукции', User)}
        </nav>

        <div className="hidden sm:block ml-auto">
          {connected ? (
            <div className="flex items-center gap-2 bg-parchment-2 border border-parchment-3 rounded-xl px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-riznica-green flex-shrink-0" />
              <span className="font-mono text-xs text-ink-soft">{shortKey}</span>
              <button onClick={disconnect} className="text-xs text-ink-muted hover:text-riznica-red transition-colors ml-1">
                Исклучи
              </button>
            </div>
          ) : (
            <button
              onClick={() => setVisible(true)}
              className="flex items-center gap-2 text-sm font-medium bg-ink text-parchment px-4 py-2 rounded-xl hover:opacity-85 transition-opacity"
            >
              <Wallet size={14} />
              Поврзи паричник
            </button>
          )}
        </div>

        <button
          className="sm:hidden ml-auto p-2 rounded-lg text-ink-muted hover:bg-parchment-2 transition-colors"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Мени"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-parchment-3 bg-parchment px-4 py-4 flex flex-col gap-2">
          {navLink('/', 'Аукции', Archive)}
          {navLink('/sell', 'Листај', Plus)}
          {connected && navLink('/my-auctions', 'Мои аукции', User)}

          <div className="mt-2 pt-3 border-t border-parchment-3">
            {connected ? (
              <div className="flex items-center justify-between bg-parchment-2 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-riznica-green" />
                  <span className="font-mono text-xs text-ink-soft">{shortKey}</span>
                </div>
                <button onClick={() => { disconnect(); setMenuOpen(false) }} className="text-xs text-ink-muted hover:text-riznica-red">
                  Исклучи
                </button>
              </div>
            ) : (
              <button onClick={() => { setVisible(true); setMenuOpen(false) }} className="btn-primary">
                <Wallet size={15} />
                Поврзи паричник
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}