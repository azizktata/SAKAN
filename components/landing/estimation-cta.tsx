'use client'

import { useState } from 'react'
import Link from 'next/link'

const MARKET_DATA = {
  vente: [
    { city: 'Tunis Centre', type: 'Appartement', price: '3 400', trend: '+4%' },
    { city: 'La Marsa',     type: 'Villa',        price: '7 200', trend: '+8%' },
    { city: 'Sousse',       type: 'Appartement', price: '2 750', trend: '+3%' },
    { city: 'Sfax',         type: 'Maison',       price: '1 950', trend: '+2%' },
  ],
  location: [
    { city: 'Tunis Centre', type: 'Appartement', price: '1 800 DT', trend: '+6%' },
    { city: 'La Marsa',     type: 'Villa',        price: '4 500 DT', trend: '+10%' },
    { city: 'Sousse',       type: 'Appartement', price: '1 100 DT', trend: '+4%' },
    { city: 'Sfax',         type: 'Appartement', price: '750 DT',   trend: '+3%' },
  ],
} as const

function IconArrow() {
  return (
    <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}

function IconSparkle() {
  return (
    <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
    </svg>
  )
}

export function EstimationCta() {
  const [mode, setMode] = useState<'vente' | 'location'>('vente')
  const rows = MARKET_DATA[mode]
  const unit = mode === 'vente' ? 'DT/m²' : 'DT/mois'

  return (
    <section className="py-20 md:py-28" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Section header */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h2 className="font-display font-bold leading-tight"
              style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)', color: 'var(--color-text)', letterSpacing: '-0.025em' }}>
              Combien vaut votre bien,<br />
              <span style={{ color: 'var(--color-accent)' }}>vraiment&nbsp;?</span>
            </h2>
          </div>

          {/* Toggle */}
          <div className="flex items-center gap-0 shrink-0"
            style={{ border: '1px solid oklch(50% 0.06 130)' }}>
            {(['vente', 'location'] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)}
                className="px-5 py-2 text-sm font-semibold transition-colors duration-150"
                style={mode === m
                  ? { background: 'var(--color-accent)', color: '#fff' }
                  : { color: 'oklch(68% 0.01 70)', background: 'transparent' }
                }>
                {m === 'vente' ? 'Vente' : 'Location'}
              </button>
            ))}
          </div>
        </div>

        {/* Main panel */}
        <div className="grid md:grid-cols-2 gap-px overflow-hidden"
          style={{ border: '1px solid var(--color-border-strong)' }}>

          {/* Left — value prop */}
          <div className="flex flex-col justify-between px-8 md:px-12 py-12"
            style={{ background: 'var(--color-surface)' }}>
            <div>
              <p className="leading-relaxed mb-8"
                style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', maxWidth: '40ch', fontFamily: 'var(--font-sans)', lineHeight: 1.7 }}>
                Notre modèle d&rsquo;intelligence artificielle analyse les prix réels du marché tunisien,
                les tendances par quartier, la superficie, le type de bien et plus de 15 autres critères.
              </p>

              {/* Feature list */}
              <ul className="space-y-3 mb-10">
                {[
                  'Résultat en moins de 30 secondes',
                  'Données marché 2025–2026 en temps réel',
                  'Précision validée sur 10 000+ transactions',
                  'Gratuit, sans inscription',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                      style={{ background: 'var(--color-accent-dim)', border: '1px solid var(--color-accent)' }}>
                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}
                        style={{ color: 'var(--color-accent)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="?estimer=open"
              className="inline-flex items-center gap-2 px-7 py-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 self-start"
              style={{ background: 'var(--color-accent)', borderRadius: '3px', fontFamily: 'var(--font-sans)' }}
            >
              <IconSparkle />
              Estimer mon bien gratuitement
              <IconArrow />
            </Link>
          </div>

          {/* Right — live market data */}
          <div className="flex flex-col" style={{ background: 'var(--color-primary)' }}>
            {/* Header */}
            <div className="px-8 pt-8 pb-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid oklch(35% 0.06 130)' }}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em]"
                style={{ color: 'oklch(55% 0.012 70)', fontFamily: 'var(--font-sans)' }}>
                Prix médians · Tunisie 2026
              </p>
              <span className="text-xs px-2 py-1 font-semibold"
                style={{ background: 'oklch(58% 0.14 45 / 0.2)', color: 'var(--color-accent-light)', borderRadius: '3px', fontFamily: 'var(--font-sans)' }}>
                {mode === 'vente' ? 'Vente' : 'Location'}
              </span>
            </div>

            {/* Table */}
            <table className="w-full flex-1" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid oklch(35% 0.06 130)' }}>
                  {['Ville', 'Type', unit, 'Tendance'].map((h, i) => (
                    <th key={h}
                      className={`px-8 py-3 text-xs font-semibold uppercase tracking-wider ${i >= 2 ? 'text-right' : 'text-left'}`}
                      style={{ color: 'oklch(50% 0.012 70)', fontFamily: 'var(--font-sans)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={row.city}
                    style={{ borderBottom: i < rows.length - 1 ? '1px solid oklch(32% 0.05 130)' : undefined }}>
                    <td className="px-8 py-4 font-semibold whitespace-nowrap"
                      style={{ color: 'oklch(90% 0.01 70)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem' }}>
                      {row.city}
                    </td>
                    <td className="px-8 py-4"
                      style={{ color: 'oklch(55% 0.012 70)', fontFamily: 'var(--font-sans)', fontSize: '0.8125rem' }}>
                      {row.type}
                    </td>
                    <td className="px-8 py-4 text-right font-display font-bold tabular-nums whitespace-nowrap"
                      style={{ color: 'var(--color-accent-light)', fontSize: '1rem', letterSpacing: '-0.01em' }}>
                      {row.price}
                    </td>
                    <td className="px-8 py-4 text-right text-xs font-semibold"
                      style={{ color: 'oklch(62% 0.1 145)', fontFamily: 'var(--font-sans)' }}>
                      {row.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="px-8 py-4" style={{ borderTop: '1px solid oklch(32% 0.05 130)' }}>
              <p className="text-xs" style={{ color: 'oklch(42% 0.01 70)', fontFamily: 'var(--font-sans)' }}>
                Source : données SAKAN · marché tunisien T1 2026
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
