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
  'locaux-commerciaux': 'Local commercial',
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
    return `/logements?location=${slug}&mode=${mode}`
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

        {/* Header: title + Vente/Location toggle */}
        <div className="flex items-end justify-between mb-10 gap-4">
          <div>
            <h2
              className="font-display font-semibold mb-1"
              style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-text)' }}
            >
              Explorer par ville
            </h2>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Les marchés les plus actifs en ce moment.
            </p>
          </div>

          {/* Vente / Location toggle */}
          <div
            className="flex items-center gap-1 rounded-xl p-1 shrink-0 border"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)' }}
          >
            {(['vente', 'location'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150"
                style={
                  mode === m
                    ? { background: 'var(--color-primary)', color: '#fff' }
                    : { color: 'var(--color-text-secondary)', background: 'transparent' }
                }
              >
                {m === 'vente' ? 'Vente' : 'Location'}
              </button>
            ))}
          </div>
        </div>

        {/* Asymmetric city grid: Tunis featured (row-span-2) + 2×2 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4" style={{ gridAutoRows: '170px' }}>
          <Link
            href={cityHref(CITIES[0].slug)}
            className="group relative rounded-2xl overflow-hidden col-span-1 row-span-2"
          >
            <Image
              src={CITIES[0].img}
              alt={CITIES[0].name}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 p-5">
              <span className="block font-display font-semibold text-2xl text-white">{CITIES[0].name}</span>
              <span className="text-xs text-white/70">{CITIES[0].count} biens</span>
            </div>
          </Link>

          {CITIES.slice(1).map((city) => (
            <Link
              key={city.slug}
              href={cityHref(city.slug)}
              className="group relative rounded-2xl overflow-hidden"
            >
              <Image
                src={city.img}
                alt={city.name}
                fill
                sizes="(max-width: 768px) 50vw, 22vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 p-4">
                <span className="block font-display font-semibold text-lg text-white">{city.name}</span>
                <span className="text-[0.7rem] text-white/65">{city.count} biens</span>
              </div>
            </Link>
          ))}
        </div>

          <div className='flex items-center justify-between mt-3'>

      

        {/* Property type chips — carry the active mode */}
        <div className="mt-0 flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((t) => (
            <Link
              key={t.slug}
              href={typeHref(t.slug)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all duration-150 hover:shadow-md"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                background: 'var(--color-surface)',
              }}
            >
              {t.name}
              <span
                className="text-[0.65rem] px-1.5 py-0.5 rounded-full"
                style={{ background: 'var(--color-bg)', color: 'var(--color-muted)' }}
              >
                {t.count}
              </span>
            </Link>
          ))}
        </div>
          {/* "Voir tout" link */}
        <div className="flex justify-end">
          <Link
            href={`/logements?mode=${mode}`}
            className="flex items-center gap-1.5 text-sm font-medium transition-colors"
            style={{ color: 'var(--color-primary)' }}
          >
            Tous les logements <IconArrow />
          </Link>
        </div>
                </div>

      </div>
    </section>
  )
}
