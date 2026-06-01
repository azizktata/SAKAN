'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminApi, type Property, type PropertyStatus } from '@/lib/api'

type StatusFilter = 'all' | PropertyStatus

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: 'Publié',    color: 'var(--color-primary)',        bg: 'oklch(42% 0.09 155 / 0.08)' },
  draft:     { label: 'Brouillon', color: 'var(--color-text-secondary)', bg: 'oklch(42% 0.009 155 / 0.06)' },
  sold:      { label: 'Vendu',     color: 'var(--color-accent)',         bg: 'oklch(68% 0.1 78 / 0.1)' },
  rented:    { label: 'Loué',      color: 'var(--color-accent)',         bg: 'oklch(68% 0.1 78 / 0.1)' },
}

const ALL_STATUSES: { value: PropertyStatus; label: string }[] = [
  { value: 'published', label: 'Publié' },
  { value: 'draft',     label: 'Brouillon' },
  { value: 'sold',      label: 'Vendu' },
  { value: 'rented',    label: 'Loué' },
]

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Appartement', villa: 'Villa', house: 'Maison',
  land: 'Terrain', commercial: 'Commercial', office: 'Bureau',
}

function fmt(n: number) { return n.toLocaleString('fr-TN') }

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all',       label: 'Tout' },
  { value: 'published', label: 'Publiés' },
  { value: 'draft',     label: 'Brouillons' },
  { value: 'sold',      label: 'Vendus' },
  { value: 'rented',    label: 'Loués' },
]

const PER_PAGE = 20

export default function AdminAnnoncesPage() {
  const [filter, setFilter]         = useState<StatusFilter>('all')
  const [search, setSearch]         = useState('')
  const [debouncedSearch, setDebounced] = useState('')
  const [properties, setProperties] = useState<Property[]>([])
  const [total, setTotal]           = useState(0)
  const [lastPage, setLastPage]     = useState(1)
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(true)
  const [confirmDelete, setConfirmDelete]   = useState<string | null>(null)
  const [changingStatus, setChangingStatus] = useState<string | null>(null)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(() => {
    setLoading(true)
    adminApi.properties({
      status:   filter === 'all' ? undefined : filter,
      search:   debouncedSearch || undefined,
      page,
      per_page: PER_PAGE,
      sort:     'newest',
    })
      .then((r) => {
        setProperties(r.data.data)
        setTotal(r.data.total)
        setLastPage(r.data.last_page)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [filter, debouncedSearch, page])

  useEffect(() => { load() }, [load])

  // Reset to page 1 on filter/search change
  useEffect(() => { setPage(1) }, [filter, debouncedSearch])

  function handleStatusChange(id: string, status: PropertyStatus) {
    adminApi.updateProperty(id, { status }).catch(() => {})
    setProperties((prev) => prev.map((p) => p.id === id ? { ...p, status } : p))
    setChangingStatus(null)
  }

  function handleDelete(id: string) {
    adminApi.deleteProperty(id).catch(() => {})
    setProperties((prev) => prev.filter((p) => p.id !== id))
    setTotal((t) => t - 1)
    setConfirmDelete(null)
  }

  return (
    <main className="flex-1 px-6 py-8 max-w-6xl w-full">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--color-text)' }}>Annonces</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {total} bien{total !== 1 ? 's' : ''} au total
          </p>
        </div>
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--color-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 w-56"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          />
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {STATUS_FILTERS.map((f) => (
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
        <>
          <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'var(--color-bg)' }}>
                  {['Bien', 'Prix', 'Statut', 'Date', 'Supprimer'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--color-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ background: 'var(--color-surface)' }}>
                {properties.map((p, i) => {
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
                      {/* Status — click badge to change */}
                      <td className="px-4 py-3.5">
                        {changingStatus === p.id ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              defaultValue={p.status}
                              onChange={(e) => handleStatusChange(p.id, e.target.value as PropertyStatus)}
                              className="appearance-none text-xs font-semibold px-3 py-1.5 rounded-lg border focus:outline-none"
                              style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                              autoFocus
                            >
                              {ALL_STATUSES.map((st) => (
                                <option key={st.value} value={st.value}>{st.label}</option>
                              ))}
                            </select>
                            <button onClick={() => setChangingStatus(null)}
                              className="text-xs px-2 py-1.5 rounded-lg border"
                              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setChangingStatus(p.id)}>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-opacity hover:opacity-70"
                              style={{ color: s.color, background: s.bg }}>
                              {s.label}
                            </span>
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--color-muted)' }}>
                        {new Date(p.created_at).toLocaleDateString('fr-TN')}
                      </td>
                      <td className="px-4 py-3.5">
                        {confirmDelete === p.id ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => handleDelete(p.id)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                              style={{ background: 'oklch(50% 0.18 25)' }}>
                              Confirmer
                            </button>
                            <button onClick={() => setConfirmDelete(null)}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg border"
                              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmDelete(p.id)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
                            style={{ borderColor: 'var(--color-border)', color: 'oklch(50% 0.15 25)' }}>
                            Supprimer
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
                {properties.length === 0 && (
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

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Page {page} sur {lastPage}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-40"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  Précédent
                </button>
                <button
                  disabled={page >= lastPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-40"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )
}
