'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const PROPERTY_TYPES = [
  'Tous types',
  'Appartement',
  'Villa',
  'Maison',
  'Terrain',
  'Local commercial',
]

export function SearchBar() {
  const router = useRouter()
  const [mode,     setMode]     = useState<'vente' | 'location'>('vente')
  const [type,     setType]     = useState('Tous types')
  const [location, setLocation] = useState('')

  function handleSearch() {
    const params = new URLSearchParams()
    params.set('mode', mode)
    if (type && type !== 'Tous types') params.set('type', type)
    if (location.trim()) params.set('location', location.trim())
    router.push(`/logements?${params.toString()}`)
  }

  return (
    <div
      className="w-full max-w-2xl rounded-2xl bg-white p-2"
      style={{ boxShadow: '0 20px 60px oklch(15% 0.012 155 / 0.22)' }}
    >
      {/* Mode toggle */}
      <div className="flex gap-1 px-1 pt-1 pb-2">
        {(['vente', 'location'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className="px-5 py-1.5 rounded-full text-sm font-medium capitalize transition-colors duration-150"
            style={
              mode === m
                ? { background: 'var(--color-primary)', color: '#fff' }
                : { color: 'var(--color-text-secondary)' }
            }
          >
            {m === 'vente' ? 'Acheter' : 'Louer'}
          </button>
        ))}
      </div>

      {/* Inputs row */}
      <div className="flex flex-col sm:flex-row gap-2 p-1">
        {/* Type */}
        <div className="relative flex-1">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full appearance-none rounded-xl border px-4 py-3 pr-8 text-sm focus:outline-none focus:ring-2 transition-shadow"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              '--tw-ring-color': 'var(--color-primary)',
            } as React.CSSProperties}
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--color-muted)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Location */}
        <div className="relative flex-[2]">
          <svg
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--color-muted)' }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            type="text"
            placeholder="Ville, quartier…"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full rounded-xl border pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 transition-shadow"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              '--tw-ring-color': 'var(--color-primary)',
            } as React.CSSProperties}
          />
        </div>

        {/* CTA */}
        <button
          type="button"
          onClick={handleSearch}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-colors duration-150"
          style={{ background: 'var(--color-primary)' }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = 'var(--color-primary-dark)')
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = 'var(--color-primary)')
          }
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Rechercher
        </button>
      </div>
    </div>
  )
}
