'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CITIES } from '@/data/cities'
import type { Location } from '@/lib/api'

const PROPERTY_TYPES = [
  'Tous types',
  'Appartement',
  'Villa',
  'Maison',
  'Terrain',
  'Local commercial',
]

function ChevronDown() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4"
      style={{ color: 'var(--color-text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
      style={{ color: 'var(--color-text-secondary)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

interface SearchBarProps {
  onModeChange?: (mode: 'vente' | 'location') => void
  locations?: Location[]
}

export function SearchBar({ onModeChange, locations }: SearchBarProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'vente' | 'location'>('vente')
  const [type, setType] = useState('Tous types')
  const [city, setCity] = useState('')

  function handleModeChange(m: 'vente' | 'location') {
    setMode(m)
    onModeChange?.(m)
  }

  const wrapperStyle: React.CSSProperties = {
    background: 'oklch(99% 0.008 70)',
    boxShadow: '0 20px 60px oklch(12% 0.02 70 / 0.25)',
    borderRadius: '12px',
  }

  const inputStyle: React.CSSProperties = {
    background: 'var(--color-bg)',
    borderColor: 'var(--color-border)',
    color: 'var(--color-text)',
  }

  const toggleInactiveColor = 'var(--color-text-secondary)'

  function handleSearch() {
    const params = new URLSearchParams()
    params.set('mode', mode)
    if (type && type !== 'Tous types') params.set('type', type)
    if (city) params.set('location', city)
    router.push(`/logements?${params.toString()}`)
  }

  const radius = '12px'

  return (
    <div className="w-full max-w-2xl p-2" style={wrapperStyle}>
      {/* Mode toggle */}
      <div className="flex gap-1 px-1 pt-1 pb-2">
        {(['vente', 'location'] as const).map((m) => (
          <button key={m} type="button" onClick={() => handleModeChange(m)}
            className="px-5 py-1.5 rounded-full text-sm font-medium transition-colors duration-150"
            style={mode === m
              ? { background: 'var(--color-accent)', color: '#fff' }
              : { color: toggleInactiveColor }
            }>
            {m === 'vente' ? 'Acheter' : 'Louer'}
          </button>
        ))}
      </div>

      {/* Inputs row */}
      <div className="flex flex-col sm:flex-row gap-2 p-1">
        {/* Type select */}
        <div className="relative flex-1">
          <select value={type} onChange={(e) => setType(e.target.value)}
            className="w-full appearance-none border px-4 py-3 pr-8 text-sm focus:outline-none"
            style={{ ...inputStyle, borderRadius: radius }}>
            {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <ChevronDown />
        </div>

        {/* City select — uses API locations when available, falls back to CITIES */}
        <div className="relative flex-1">
          <PinIcon />
          <select value={city} onChange={(e) => setCity(e.target.value)}
            className="w-full appearance-none border pl-9 pr-8 py-3 text-sm focus:outline-none"
            style={{ ...inputStyle, borderRadius: radius }}>
            <option value="">Toutes les villes</option>
            {locations && locations.length > 0 ? (
              <>
                <optgroup label="Gouvernorats">
                  {locations
                    .filter((l) => !l.parent_id)
                    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
                    .map((l) => (
                      <option key={l.id} value={l.slug}>{l.name}</option>
                    ))}
                </optgroup>
                <optgroup label="Villes & quartiers">
                  {locations
                    .filter((l) => l.parent_id)
                    .sort((a, b) => a.name.localeCompare(b.name, 'fr'))
                    .map((l) => (
                      <option key={l.id} value={l.slug}>{l.name}</option>
                    ))}
                </optgroup>
              </>
            ) : (
              CITIES.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))
            )}
          </select>
          <ChevronDown />
        </div>

        {/* Search button */}
        <button type="button" onClick={handleSearch}
          className="flex shrink-0 items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-opacity duration-150 hover:opacity-90"
          style={{ background: 'var(--color-accent)', borderRadius: radius }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Rechercher
        </button>
      </div>
    </div>
  )
}
