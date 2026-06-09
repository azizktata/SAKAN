'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CITIES } from '@/data/cities'
import { PROPERTY_TYPES } from '@/data/property-types'

const slugToType: Record<string, string> = {
  appartements: 'Appartement',
  villas: 'Villa',
  maisons: 'Maison',
  terrains: 'Terrain',
  'locaux-commerciaux': 'Commercial',
}

// Numeric location IDs from the API (governorate level for broad results)
const slugToLocationId: Record<string, number> = {
  'tunis':    1,
  'ariana':   2,
  'nabeul':   5,
  'sousse':   12,
  'monastir': 13,
  'sfax':     15,
  'la-marsa': 25,
  'hammamet': 46,
}

function IconArrow() {
  return (
    <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}

export function BrowseSection() {
  const [mode, setMode] = useState<'vente' | 'location'>('vente')

  function cityHref(slug: string) {
    const id = slugToLocationId[slug]
    return id
      ? `/logements?locationId=${id}&mode=${mode}`
      : `/logements?mode=${mode}`
  }

  function typeHref(slug: string) {
    const type = slugToType[slug]
    return type
      ? `/logements?type=${encodeURIComponent(type)}&mode=${mode}`
      : `/logements?mode=${mode}`
  }

  return (
    <section className="py-20 md:py-28" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-6">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <h2 className="font-display font-bold leading-tight"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
              Les marchés<br className="hidden md:block" /> les plus actifs.
            </h2>
          </div>

          {/* Vente / Location toggle — flat, editorial */}
          <div className="flex items-center gap-0 shrink-0"
            style={{ border: '1px solid var(--color-border-strong)' }}>
            {(['vente', 'location'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-5 py-2 text-sm font-semibold transition-colors duration-150"
                style={mode === m
                  ? { background: 'var(--color-primary)', color: '#fff' }
                  : { color: 'var(--color-text-secondary)', background: 'transparent' }
                }
              >
                {m === 'vente' ? 'Vente' : 'Location'}
              </button>
            ))}
          </div>
        </div>

        {/* City grid — flush tiles, no border-radius, editorial */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1" style={{ gridAutoRows: '180px' }}>
          <Link
            href={cityHref(CITIES[0].slug)}
            className="group relative overflow-hidden col-span-1 row-span-2"
          >
            <Image
              src={CITIES[0].img}
              alt={CITIES[0].name}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5 md:p-6">
              <span className="block font-display font-bold text-white"
                style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', letterSpacing: '-0.02em' }}>
                {CITIES[0].name}
              </span>
              <span className="text-xs mt-0.5 block"
                style={{ color: 'oklch(80% 0.01 70)', fontFamily: 'var(--font-sans)' }}>
                {CITIES[0].count} biens
              </span>
            </div>
          </Link>

          {CITIES.slice(1).map((city) => (
            <Link
              key={city.slug}
              href={cityHref(city.slug)}
              className="group relative overflow-hidden"
            >
              <Image
                src={city.img}
                alt={city.name}
                fill
                sizes="(max-width: 768px) 50vw, 22vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4 md:p-5">
                <span className="block font-display font-bold text-lg text-white"
                  style={{ letterSpacing: '-0.01em' }}>
                  {city.name}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom row: type chips + voir tout */}
        <div className="flex items-center justify-between mt-6 gap-4 flex-wrap">
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map((t) => (
              <Link
                key={t.slug}
                href={typeHref(t.slug)}
                className="flex items-center px-4 py-2 text-sm font-medium transition-colors duration-150 hover:bg-[oklch(32%_0.08_130_/_0.05)]"
                style={{
                  border: '1px solid var(--color-border-strong)',
                  color: 'var(--color-text)',
                  background: 'var(--color-surface)',
                }}
              >
                {t.name}
              </Link>
            ))}
          </div>
          <Link
            href={`/logements?mode=${mode}`}
            className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70 shrink-0"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-sans)' }}
          >
            Tous les logements <IconArrow />
          </Link>
        </div>

      </div>
    </section>
  )
}
