'use client'

import { useState, useEffect } from 'react'
import { adminApi, type Property, type PropertyStatus } from '@/lib/api'

type StatusFilter = 'all' | PropertyStatus

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: 'Publié',    color: 'var(--color-primary)',        bg: 'oklch(42% 0.09 155 / 0.08)' },
  draft:     { label: 'Brouillon', color: 'var(--color-text-secondary)', bg: 'oklch(42% 0.009 155 / 0.06)' },
  sold:      { label: 'Vendu',     color: 'var(--color-accent)',         bg: 'oklch(68% 0.1 78 / 0.1)' },
  rented:    { label: 'Loué',      color: 'var(--color-accent)',         bg: 'oklch(68% 0.1 78 / 0.1)' },
}

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Appartement', villa: 'Villa', house: 'Maison',
  land: 'Terrain', commercial: 'Commercial', office: 'Bureau',
}

function fmt(n: number) { return n.toLocaleString('fr-TN') }

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all',       label: 'Tout' },
  { value: 'published', label: 'Publiés' },
  { value: 'draft',     label: 'Brouillons' },
  { value: 'sold',      label: 'Vendus' },
  { value: 'rented',    label: 'Loués' },
]

export default function AdminAnnoncesPage() {
  const [filter, setFilter]     = useState<StatusFilter>('all')
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    adminApi.properties()
      .then((res) => setProperties(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const visible = filter === 'all' ? properties : properties.filter((p) => p.status === filter)

  function handlePublish(id: string) {
    adminApi.updateProperty(id, { status: 'published' }).catch(() => {})
    setProperties((prev) => prev.map((p) => p.id === id ? { ...p, status: 'published' } : p))
  }

  function handleDelete(id: string) {
    adminApi.deleteProperty(id).catch(() => {})
    setProperties((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <main className="flex-1 px-6 py-8 max-w-5xl w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--color-text)' }}>Annonces</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {properties.length} biens au total
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors border"
            style={{
              borderColor: filter === f.value ? 'var(--color-primary)' : 'var(--color-border)',
              background:  filter === f.value ? 'oklch(42% 0.09 155 / 0.08)' : 'transparent',
              color:       filter === f.value ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-bg)' }}>
                {['Bien', 'Prix', 'Statut', 'Date', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--color-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ background: 'var(--color-surface)' }}>
              {visible.map((p, i) => {
                const s = STATUS_META[p.status] ?? STATUS_META.draft
                return (
                  <tr key={p.id} style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : 'none' }}>
                    <td className="px-4 py-3.5">
                      <p className="font-medium truncate max-w-[220px]" style={{ color: 'var(--color-text)' }}>{p.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                        {TYPE_LABELS[p.property_type] ?? p.property_type} · {p.transaction_type === 'sale' ? 'Vente' : 'Location'}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 font-display font-semibold tabular-nums text-xs" style={{ color: 'var(--color-text)' }}>
                      {fmt(p.price)}{p.transaction_type === 'rent' ? ' DT/m' : ' DT'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ color: s.color, background: s.bg }}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--color-muted)' }}>
                      {new Date(p.created_at).toLocaleDateString('fr-TN')}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        {p.status === 'draft' && (
                          <button onClick={() => handlePublish(p.id)}
                            className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-80"
                            style={{ background: 'var(--color-primary)' }}>
                            Publier
                          </button>
                        )}
                        <button onClick={() => handleDelete(p.id)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
                          style={{ borderColor: 'var(--color-border)', color: 'oklch(50% 0.15 25)' }}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm"
                    style={{ color: 'var(--color-muted)' }}>
                    Aucune annonce dans cette catégorie.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
