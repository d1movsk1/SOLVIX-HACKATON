import { useState, useEffect } from 'react'

const pad = n => String(n).padStart(2, '0')

export default function Countdown({ endsAt, className = '' }) {
  const [left, setLeft] = useState(endsAt - Date.now())

  useEffect(() => {
    const id = setInterval(() => setLeft(endsAt - Date.now()), 1000)
    return () => clearInterval(id)
  }, [endsAt])

  if (left <= 0) return <span className={className}>Завршена</span>

  const h = Math.floor(left / 3_600_000)
  const m = Math.floor((left % 3_600_000) / 60_000)
  const s = Math.floor((left % 60_000) / 1_000)

  if (h >= 24) {
    const d = Math.floor(h / 24)
    return <span className={className}>{d}д {h % 24}ч</span>
  }

  return <span className={className}>{pad(h)}:{pad(m)}:{pad(s)}</span>
}
