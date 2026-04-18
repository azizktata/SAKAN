'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

export type ManagedProperty = {
  id: string
  title: string
  location: string
  price: number
  mode: 'vente' | 'location'
  status: 'draft' | 'published' | 'sold' | 'rented'
  image: string
}

const STATUS_META: Record<ManagedProperty['status'], { label: string; color: string; bg: string }> = {
  published: { label: 'Publié',    color: 'var(--color-primary)',        bg: 'oklch(42% 0.09 155 / 0.08)' },
  draft:     { label: 'Brouillon', color: 'var(--color-text-secondary)', bg: 'oklch(42% 0.009 155 / 0.06)' },
  sold:      { label: 'Vendu',     color: 'var(--color-accent)',         bg: 'oklch(68% 0.1 78 / 0.1)' },
  rented:    { label: 'Loué',      color: 'var(--color-accent)',         bg: 'oklch(68% 0.1 78 / 0.1)' },
}

function fmt(n: number) { return n.toLocaleString('fr-TN') }

interface Props {
  property: ManagedProperty
  onDelete?: (id: string) => void
  onToggleStatus?: (id: string, status: 'published' | 'draft') => void
}

export function PropertyCardManage({ property, onDelete, onToggleStatus }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const meta = STATUS_META[property.status]
  const canToggle = property.status === 'published' || property.status === 'draft'

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <Image src={property.image} alt={property.title} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ color: meta.color, background: meta.bg, backdropFilter: 'blur(6px)' }}>
          {meta.label}
        </span>
      </div>

      {/* Body */}
      <div className="p-4">
        <p className="font-display font-semibold text-sm leading-snug mb-0.5 truncate" style={{ color: 'var(--color-text)' }}>
          {property.title}
        </p>
        <p className="text-xs mb-3 truncate" style={{ color: 'var(--color-muted)' }}>{property.location}</p>
        <p className="font-display font-bold tabular-nums text-sm" style={{ color: 'var(--color-text)' }}>
          {fmt(property.price)}{' '}
          <span className="font-normal text-xs" style={{ color: 'var(--color-muted)' }}>
            {property.mode === 'location' ? 'DT / mois' : 'DT'}
          </span>
        </p>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex items-center gap-2">
        <Link href={`/espace-client/annonces/${property.id}/modifier`}
          className="flex-1 py-2 rounded-xl border text-xs font-semibold text-center transition-colors"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
          Modifier
        </Link>

        {canToggle && (
          <button
            onClick={() => onToggleStatus?.(property.id, property.status === 'published' ? 'draft' : 'published')}
            className="flex-1 py-2 rounded-xl border text-xs font-semibold transition-colors"
            style={{
              borderColor: property.status === 'published' ? 'var(--color-border)' : 'var(--color-primary)',
              color: property.status === 'published' ? 'var(--color-text-secondary)' : 'var(--color-primary)',
              background: property.status === 'published' ? 'transparent' : 'oklch(42% 0.09 155 / 0.06)',
            }}
          >
            {property.status === 'published' ? 'Dépublier' : 'Publier'}
          </button>
        )}

        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            aria-label="Supprimer"
            className="w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors hover:border-red-300 hover:bg-red-50"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        ) : (
          <div className="flex gap-1">
            <button
              onClick={() => { onDelete?.(property.id); setConfirmDelete(false) }}
              className="px-2.5 py-2 rounded-xl text-xs font-semibold text-white"
              style={{ background: 'oklch(52% 0.18 25)' }}
            >
              Confirmer
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="px-2.5 py-2 rounded-xl text-xs font-medium border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
