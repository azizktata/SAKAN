'use client'

import Link from 'next/link'
import type { Property } from '@/lib/api'

interface HeroStripProps {
  saleProperties: Property[]
  rentProperties: Property[]
  mode: 'vente' | 'location'
}

function fmt(n: number) {
  return n.toLocaleString('fr-TN')
}

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Appartement', villa: 'Villa', house: 'Maison',
  land: 'Terrain', commercial: 'Local', office: 'Bureau',
}

export function HeroStrip({ saleProperties, rentProperties, mode }: HeroStripProps) {
  const props = mode === 'vente' ? saleProperties : rentProperties
  // Duplicate for seamless infinite loop
  const all = props.length > 0 ? [...props, ...props] : []

  if (all.length === 0) return null

  return (
    <div className="relative w-full overflow-hidden">
      {/* Edge fade masks */}
      <div className="absolute inset-y-0 left-0 z-10 w-20 pointer-events-none"
        style={{ background: 'linear-gradient(to right, oklch(25% 0.07 130) 0%, transparent 100%)' }} />
      <div className="absolute inset-y-0 right-0 z-10 w-20 pointer-events-none"
        style={{ background: 'linear-gradient(to left, oklch(25% 0.07 130) 0%, transparent 100%)' }} />

      <div className="flex gap-2 hero-strip-track" style={{ width: 'max-content' }}>
        {all.map((prop, i) => {
          const cover = prop.images?.find((img) => img.is_cover) ?? prop.images?.[0]
          const typeLabel = TYPE_LABELS[prop.property_type] ?? prop.property_type
          const locName = prop.location?.name ?? ''
          const isSale = prop.transaction_type === 'sale'

          return (
            <Link
              key={`${prop.id}-${i}`}
              href={`/logements/${prop.id}`}
              className="group relative shrink-0 overflow-hidden"
              style={{ width: '220px', height: '130px', borderRadius: '3px' }}
            >
              {cover ? (
                // Plain img avoids Next.js image optimizer — URLs are direct backend URLs
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cover.url}
                  alt={prop.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
              ) : (
                <div className="absolute inset-0" style={{ background: 'oklch(28% 0.06 130)' }} />
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent
                transition-opacity duration-200" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white font-semibold leading-tight truncate"
                  style={{ fontSize: '0.75rem', fontFamily: 'var(--font-sans)' }}>
                  {typeLabel}{locName ? ` · ${locName}` : ''}
                </p>
                <p style={{ fontSize: '0.65rem', fontFamily: 'var(--font-sans)', marginTop: '2px',
                  color: isSale ? 'var(--color-accent-light)' : 'oklch(82% 0.08 78)' }}>
                  {isSale
                    ? `${fmt(prop.price)} DT`
                    : `${fmt(prop.price)} DT/mois`}
                </p>
              </div>

              {/* Hover badge */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-xs font-semibold text-white px-3 py-1.5"
                  style={{ background: 'var(--color-accent)', borderRadius: '2px', fontFamily: 'var(--font-sans)' }}>
                  Voir →
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
