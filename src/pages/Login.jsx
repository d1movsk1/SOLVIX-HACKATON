import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { usePrivy } from '@privy-io/react-auth'
import { ShieldCheck, Star, Award, Mail } from 'lucide-react'

function EmailLogin({ onLogin }) {
  const [email, setEmail] = useState('')

  return (
    <div className="flex flex-col gap-2">
      <button onClick={onLogin} className="btn-primary">
        Продолжи со е-маил
      </button>
    </div>
  )
}

export default function Login() {
  const { login, authenticated, ready } = usePrivy()
  const navigate = useNavigate()

  useEffect(() => {
    if (ready && authenticated) navigate('/')
  }, [ready, authenticated, navigate])

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* Лева страна */}
        <div className="flex flex-col gap-8">
          <div>
            <p className="section-eyebrow">Добредојдовте</p>
            <h1 className="font-display text-5xl sm:text-6xl font-bold leading-[1.05] text-ink mb-5">
              Ризница
            </h1>
            <p className="text-xl font-serif text-ink-soft leading-relaxed">
              Платформа за аукции на автентични рачно изработени предмети од Македонија.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {[
              {
                icon: ShieldCheck,
                title: 'Дигитален сертификат',
                desc: 'Секој предмет добива дигитален доказ за автентичност кој стои засекогаш.',
              },
              {
                icon: Award,
                title: 'Безбедни трансакции',
                desc: 'Парите се чуваат безбедно до крај на аукцијата — автоматски и без посредници.',
              },
              {
                icon: Star,
                title: 'Лесна регистрација',
                desc: 'Само влези со твојот Google account — без технички знаење потребно.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-white/50 rounded-2xl p-4 border border-parchment-3">
                <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center flex-shrink-0">
                  <Icon size={20} className="text-gold-dim" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="font-semibold text-ink mb-0.5">{title}</p>
                  <p className="text-sm text-ink-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Десна страна — login box */}
        <div className="flex flex-col gap-6">
          <div className="bg-white/70 backdrop-blur-sm border border-parchment-3 rounded-3xl p-8 shadow-lift flex flex-col gap-6">

            <div className="text-center">
              <h2 className="font-display text-3xl font-bold text-ink mb-2">
                Влези во Ризница
              </h2>
              <p className="text-base text-ink-muted">
                Внеси го твојот е-маил за да продолжиш
              </p>
            </div>

            <EmailLogin onLogin={login} />

            <div className="bg-parchment-2 rounded-2xl px-5 py-4 flex items-start gap-3">
              <ShieldCheck size={18} className="text-riznica-green flex-shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-sm text-ink-muted leading-relaxed">
                Автоматски ти се креира дигитален паричник. Не мораш да знаеш ништо за блокчејн — ние се грижиме за сè.
              </p>
            </div>
          </div>
      

        <p className="text-center text-sm text-ink-muted">
          Со влегувањето се согласуваш со условите за користење на Ризница.
        </p>
      </div>
    </div>
    </main >
  )
}