'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { PropertyCardManage, type ManagedProperty, type PropertyCardStats } from '@/components/espace-client/property-card-manage'
import { propertiesApi, analyticsApi, type PropertyStats } from '@/lib/api'
import { StatsDrawer } from './stats-drawer'

function toManaged(p: {
  id: string; title: string; price: number; status: string; transaction_type: string;
  location?: { name: string } | null; address?: string | null;
  images?: { url: string; is_cover: boolean }[]
}): ManagedProperty {
  const cover = p.images?.find((i) => i.is_cover) ?? p.images?.[0]
  return {
    id:       p.id,
    title:    p.title,
    location: p.location?.name ?? p.address ?? '—',
    price:    p.price,
    mode:     p.transaction_type === 'sale' ? 'vente' : 'location',
    status:   p.status as ManagedProperty['status'],
    image:    cover?.url ?? '/prop-1.jpg',
  }
}

export default function AnnoncesPage() {
  const [properties, setProperties] = useState<ManagedProperty[]>([])
  const [statsMap, setStatsMap]     = useState<Record<string, PropertyCardStats>>({})
  const [loading, setLoading]       = useState(true)
  const [drawerOpen, setDrawerOpen] = useState<{ id: string; title: string } | null>(null)
  const closeDrawer = useCallback(() => setDrawerOpen(null), [])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  // Reset to page 1 when search changes
  useEffect(() => { setPage(1) }, [search])
  const PAGE_SIZE = 9
  const filtered = search.trim()
    ? properties.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : properties
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const pagedProperties = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  useEffect(() => {
    propertiesApi.myList()
      .then((res) => {
        const managed = res.data.data.map(toManaged)
        setProperties(managed)
        // Fetch summary stats for all properties in one call
        return analyticsApi.ownerSummary().then(s => s.data).catch(() => null).then(summary => {
          if (!summary) return
          // Fetch per-property stats individually for badge display
          managed.forEach(p => {
            analyticsApi.propertyStats(p.id).then(r => {
              setStatsMap(prev => ({
                ...prev,
                [p.id]: {
                  total_views:     r.data.total_views,
                  unique_views:    r.data.unique_views,
                  total_contacts:  r.data.total_contacts,
                  conversion_rate: r.data.conversion_rate,
                },
              }))
            }).catch(() => {})
          })
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleDelete(id: string) {
    propertiesApi.delete(id).catch(() => {})
    setProperties((prev) => prev.filter((p) => p.id !== id))
  }

  function handleToggleStatus(id: string, status: 'published' | 'draft') {
    propertiesApi.update(id, { status }).catch(() => {})
    setProperties((prev) => prev.map((p) => p.id === id ? { ...p, status } : p))
  }

  function handleMarkClosed(id: string, status: 'sold' | 'rented') {
    propertiesApi.update(id, { status }).catch(() => {})
    setProperties((prev) => prev.map((p) => p.id === id ? { ...p, status } : p))
  }

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl w-full">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--color-text)' }}>
            Mes annonces
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {search ? `${filtered.length} / ${properties.length}` : properties.length} bien{properties.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search bar */}
          <div className="flex items-center gap-0 rounded-xl border overflow-hidden"
            style={{ borderColor: search ? 'var(--color-primary)' : 'var(--color-border)', background: 'var(--color-surface)', minWidth: '220px' }}>
            <span className="pl-3 shrink-0">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--color-muted)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par titre…"
              className="flex-1 text-sm bg-transparent focus:outline-none px-2.5 py-2"
              style={{ color: 'var(--color-text)', minWidth: 0 }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="px-2 hover:opacity-70 shrink-0" style={{ color: 'var(--color-muted)' }}>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <Link href="?publish=open"
            className="px-5 py-2.5 rounded-full text-sm font-semibold text-white shrink-0"
            style={{ background: 'var(--color-primary)' }}>
            + Publier
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🏠</p>
          <p className="font-display font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Aucune annonce pour l&apos;instant
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Publiez votre premier bien en quelques minutes.
          </p>
          <Link href="?publish=open"
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold text-white"
            style={{ background: 'var(--color-primary)' }}>
            Publier un bien
          </Link>
        </div>
      ) : pagedProperties.length === 0 && search ? (
        <div className="text-center py-20">
          <p className="font-display font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Aucun résultat pour &ldquo;{search}&rdquo;
          </p>
          <button onClick={() => setSearch('')} className="text-sm underline" style={{ color: 'var(--color-primary)' }}>
            Effacer la recherche
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedProperties.map((p) => (
              <PropertyCardManage
                key={p.id}
                property={p}
                stats={statsMap[p.id]}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onMarkClosed={handleMarkClosed}
                onViewStats={(id) => setDrawerOpen({ id, title: p.title })}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4"
              style={{ borderTop: '1px solid var(--color-border)' }}>
              <span className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Page {page} / {totalPages} · {properties.length} bien{properties.length !== 1 ? 's' : ''}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 text-xs font-medium rounded-xl disabled:opacity-40 transition-colors"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                  ← Précédent
                </button>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 text-xs font-medium rounded-xl disabled:opacity-40 transition-colors"
                  style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>
                  Suivant →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {drawerOpen && (
        <StatsDrawer
          propertyId={drawerOpen.id}
          title={drawerOpen.title}
          onClose={closeDrawer}
        />
      )}
    </main>
  )
}
