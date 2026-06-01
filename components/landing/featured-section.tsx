'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Property } from '@/lib/api'

function fmt(n: number) { return n.toLocaleString('fr-TN') }

function IconArrow() {
  return (
    <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg aria-hidden="true" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Appartement', villa: 'Villa', house: 'Maison',
  land: 'Terrain', commercial: 'Commercial', office: 'Bureau',
}

interface FeaturedSectionProps {
  saleProperties: Property[]
  rentProperties: Property[]
}

export function FeaturedSection({ saleProperties, rentProperties }: FeaturedSectionProps) {
  const [mode, setMode] = useState<'vente' | 'location'>('vente')
  const properties = (mode === 'vente' ? saleProperties : rentProperties).slice(0, 6)

  if (saleProperties.length === 0 && rentProperties.length === 0) return null

  const viewAllHref = mode === 'vente'
    ? '/logements?transaction_type=sale'
    : '/logements?transaction_type=rent'

  return (
    <section className="py-20 md:py-28" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-6">

        <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
          <h2 className="font-display font-bold leading-tight"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Ajoutés cette semaine.
          </h2>

          <div className="flex items-center gap-4">
            {/* Toggle */}
            <div className="flex items-center gap-0"
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
            <Link href={viewAllHref}
              className="hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-70"
              style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-sans)' }}>
              Voir tout <IconArrow />
            </Link>
          </div>
        </div>

        {properties.length === 0 ? (
          <p className="text-sm py-12 text-center" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>
            Aucun bien disponible pour ce type.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px"
            style={{ background: 'var(--color-border)' }}>
            {properties.map((prop, idx) => {
              const cover = prop.images?.find((i) => i.is_cover) ?? prop.images?.[0]
              const typeLabel = TYPE_LABELS[prop.property_type] ?? prop.property_type
              const modeLabel = prop.transaction_type === 'sale' ? 'Vente' : 'Location'
              const locationName = prop.location?.name ?? prop.address ?? ''
              const isFeatured = idx === 0

              return (
                <Link
                  key={prop.id}
                  href={`/logements/${prop.id}`}
                  className={isFeatured ? 'sm:col-span-2 lg:col-span-2' : ''}
                >
                  <article className="group h-full flex flex-col" style={{ background: 'var(--color-surface)' }}>
                    <div className="relative overflow-hidden" style={{ height: isFeatured ? '320px' : '200px' }}>
                      {cover ? (
                        // Plain img — avoids Next.js image optimizer issues with direct backend URLs
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover.url}
                          alt={prop.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="absolute inset-0" style={{ background: 'var(--color-surface-warm)' }} />
                      )}
                      <div className="absolute top-4 left-4 px-2.5 py-1 text-xs font-semibold text-white"
                        style={{ background: prop.transaction_type === 'sale' ? 'var(--color-primary)' : 'var(--color-accent)', borderRadius: '3px' }}>
                        {modeLabel}
                      </div>
                    </div>
                    <div className="p-5 md:p-6 flex-1 flex flex-col">
                      <p className="text-xs mb-2 flex items-center gap-1"
                        style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>
                        <IconPin /> {locationName} · {typeLabel}
                      </p>
                      <h3 className="font-display font-bold leading-snug mb-4 flex-1"
                        style={{ fontSize: isFeatured ? '1.25rem' : '1.0625rem', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                        {prop.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs mb-5"
                        style={{ color: 'var(--color-text-secondary)', fontFamily: 'var(--font-sans)' }}>
                        {prop.bedrooms != null && <span>{prop.bedrooms} ch.</span>}
                        {prop.bathrooms != null && <span>{prop.bathrooms} sdb.</span>}
                        {prop.surface != null && <span>{prop.surface} m²</span>}
                      </div>
                      <div className="flex items-center justify-between pt-4"
                        style={{ borderTop: '1px solid var(--color-border)' }}>
                        <p className="font-display font-bold tabular-nums"
                          style={{ fontSize: isFeatured ? '1.375rem' : '1.125rem', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                          {fmt(prop.price)}
                          <span className="text-sm font-normal ml-1" style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>DT</span>
                        </p>
                        <span className="text-xs font-semibold uppercase tracking-wide transition-opacity duration-150 group-hover:opacity-60"
                          style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-sans)' }}>
                          Voir →
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        )}

        <div className="mt-6 flex sm:hidden justify-center">
          <Link href={viewAllHref}
            className="flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-sans)' }}>
            Voir tous les biens <IconArrow />
          </Link>
        </div>
      </div>
    </section>
  )
}
