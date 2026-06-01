'use client'

import { useState } from 'react'
import Link from 'next/link'

function IconArrow() {
  return (
    <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}

const BUDGETS_VENTE = [
  { range: 'Moins de 150 000 DT',  label: 'Primo-accédants', sub: 'Appartements, studios, terrains',    href: '/logements?transaction_type=sale&max_price=150000'                       },
  { range: '150 000 – 350 000 DT', label: 'Familles',        sub: 'Appartements 3–4 pièces, maisons',  href: '/logements?transaction_type=sale&min_price=150000&max_price=350000'     },
  { range: '350 000 – 700 000 DT', label: 'Bien établis',    sub: 'Villas, maisons de prestige',        href: '/logements?transaction_type=sale&min_price=350000&max_price=700000'     },
  { range: 'Plus de 700 000 DT',   label: 'Premium',         sub: "Propriétés d'exception",             href: '/logements?transaction_type=sale&min_price=700000'                       },
] as const

const BUDGETS_LOCATION = [
  { range: 'Moins de 500 DT/mois',      label: 'Petits budgets', sub: 'Studios, S+1, colocations',         href: '/logements?transaction_type=rent&max_price=500'                         },
  { range: '500 – 1 000 DT/mois',       label: 'Confort',        sub: 'S+2, appartements meublés',          href: '/logements?transaction_type=rent&min_price=500&max_price=1000'          },
  { range: '1 000 – 2 500 DT/mois',     label: 'Prestige',       sub: 'Villas, appartements haut standing', href: '/logements?transaction_type=rent&min_price=1000&max_price=2500'         },
  { range: 'Plus de 2 500 DT/mois',     label: 'Exception',      sub: 'Propriétés premium & bord de mer',   href: '/logements?transaction_type=rent&min_price=2500'                        },
] as const

export function BudgetSection() {
  const [mode, setMode] = useState<'vente' | 'location'>('vente')
  const budgets = mode === 'vente' ? BUDGETS_VENTE : BUDGETS_LOCATION

  return (
    <section className="py-20 md:py-28" style={{ background: 'var(--color-surface-warm)' }}>
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <h2 className="font-display font-bold leading-tight"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Quel est votre budget&nbsp;?
          </h2>
          {/* Toggle */}
          <div className="flex items-center gap-0 shrink-0"
            style={{ border: '1px solid var(--color-border-strong)' }}>
            {(['vente', 'location'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className="px-5 py-2 text-sm font-semibold transition-colors duration-150"
                style={mode === m
                  ? { background: 'var(--color-primary)', color: '#fff' }
                  : { color: 'var(--color-text-secondary)', background: 'transparent' }
                }>
                {m === 'vente' ? 'Vente' : 'Location'}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px"
          style={{ background: 'var(--color-border-strong)' }}>
          {budgets.map((b) => (
            <Link key={b.range} href={b.href}
              className="group flex flex-col justify-between px-6 py-8 transition-colors duration-200 hover:bg-[oklch(32%_0.08_130_/_0.04)]"
              style={{ background: 'var(--color-surface)', minHeight: '200px' }}>
              <div>
                <span className="block font-display font-bold mb-3"
                  style={{ fontSize: 'clamp(1.05rem, 1.6vw, 1.3rem)', color: 'var(--color-accent)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                  {b.range}
                </span>
                <p className="font-display font-bold"
                  style={{ fontSize: '1.0625rem', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                  {b.label}
                </p>
                <p className="mt-1" style={{ fontSize: '0.8125rem', color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>
                  {b.sub}
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-semibold mt-6 transition-opacity duration-150 group-hover:opacity-70"
                style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-sans)' }}>
                Explorer <IconArrow />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
