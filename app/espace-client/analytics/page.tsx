'use client'

import { useEffect, useState } from 'react'
import { analyticsApi, type OwnerSummary, type PropertyStats, type DailyTrend } from '@/lib/api'
import { propertiesApi } from '@/lib/api'
import type { ManagedProperty } from '@/components/espace-client/property-card-manage'

type SortKey = 'views' | 'contacts' | 'conversion'

type Row = ManagedProperty & { stats: PropertyStats }

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-muted)' }}>{label}</p>
      <p className="font-display font-bold text-2xl tabular-nums" style={{ color: 'var(--color-text)' }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>{sub}</p>}
    </div>
  )
}

function SortIcon({ active, asc }: { active: boolean; asc: boolean }) {
  return (
    <svg className="w-3.5 h-3.5 ml-0.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"
      style={{ opacity: active ? 1 : 0.3 }}>
      {asc
        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
      }
    </svg>
  )
}

export default function AnalyticsPage() {
  const [summary, setSummary]         = useState<OwnerSummary | null>(null)
  const [rows, setRows]               = useState<Row[]>([])
  const [loading, setLoading]         = useState(true)
  const [sortKey, setSortKey]         = useState<SortKey>('views')
  const [sortAsc, setSortAsc]         = useState(false)
  const [selectedRow, setSelectedRow] = useState<Row | null>(null)
  const [trend, setTrend]             = useState<DailyTrend[]>([])
  const [trendLoading, setTrendLoading] = useState(false)

  function openDrawer(row: Row) {
    setSelectedRow(row)
    setTrend([])
    setTrendLoading(true)
    analyticsApi.propertyTrend(row.id, 7)
      .then(r => setTrend(r.data))
      .catch(() => {})
      .finally(() => setTrendLoading(false))
  }

  useEffect(() => {
    Promise.all([
      analyticsApi.ownerSummary(),
      propertiesApi.myList(),
    ]).then(async ([sumRes, propsRes]) => {
      setSummary(sumRes.data)
      const props = propsRes.data.data
      const statsResults = await Promise.allSettled(
        props.map(p => analyticsApi.propertyStats(p.id).then(r => ({ id: p.id, stats: r.data })))
      )
      const statsMap: Record<string, PropertyStats> = {}
      statsResults.forEach(r => {
        if (r.status === 'fulfilled') statsMap[r.value.id] = r.value.stats
      })
      const built: Row[] = props.map(p => ({
        id:       p.id,
        title:    p.title,
        location: p.location?.name ?? (p as { address?: string }).address ?? '—',
        price:    p.price,
        mode:     p.transaction_type === 'sale' ? 'vente' : 'location',
        status:   p.status as ManagedProperty['status'],
        image:    p.images?.find(i => i.is_cover)?.url ?? p.images?.[0]?.url ?? '/prop-1.jpg',
        stats:    statsMap[p.id] ?? { total_views: 0, unique_views: 0, total_contacts: 0, conversion_rate: 0 },
      }))
      setRows(built)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(false) }
  }

  const sorted = [...rows].sort((a, b) => {
    const av = sortKey === 'views' ? a.stats.total_views : sortKey === 'contacts' ? a.stats.total_contacts : a.stats.conversion_rate
    const bv = sortKey === 'views' ? b.stats.total_views : sortKey === 'contacts' ? b.stats.total_contacts : b.stats.conversion_rate
    return sortAsc ? av - bv : bv - av
  })

  if (loading) return (
    <main className="flex-1 flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
    </main>
  )

  const topId = summary?.top_property?.id

  return (
    <main className="flex-1 px-6 py-8 max-w-4xl w-full">
      <h1 className="font-display font-semibold text-2xl mb-1" style={{ color: 'var(--color-text)' }}>
        Statistiques
      </h1>
      <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        Performance de tous vos biens
      </p>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <KpiCard label="Vues totales"     value={summary?.total_views ?? 0} />
        <KpiCard label="Vues uniques"     value={summary?.total_unique_views ?? 0} />
        <KpiCard label="Contacts reçus"   value={summary?.total_contacts ?? 0} />
        <KpiCard label="Taux conversion"  value={`${Math.min(100, summary?.avg_conversion_rate ?? 0).toFixed(1)}%`}
          sub="contacts / vues uniques" />
        <KpiCard
          label="Temps moyen de visite"
          value={(() => {
            const s = summary?.avg_duration_seconds
            if (s == null) return '—'
            if (s < 60) return `${Math.round(s)}s`
            const min = Math.floor(s / 60)
            const sec = Math.round(s % 60)
            return `${min}min ${sec}s`
          })()}
        />
      </div>

      {/* Visiteurs par origine */}
      <div className="rounded-2xl p-5 mb-8" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
          Visiteurs par origine
        </p>
        {!summary?.top_countries?.length ? (
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Aucune donnée de localisation — données disponibles après le prochain tracking
          </p>
        ) : (
          <ul className="space-y-2">
            {summary.top_countries.map(({ country, views }) => (
              <li key={country} className="flex items-center justify-between gap-4">
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{country}</span>
                <span className="text-sm tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                  {views} {views === 1 ? 'vue' : 'vues'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Properties table */}
      {rows.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--color-muted)' }}>
          Aucun bien publié pour le moment.
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider"
                  style={{ color: 'var(--color-muted)' }}>
                  Bien
                </th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none"
                  style={{ color: 'var(--color-muted)' }}
                  onClick={() => toggleSort('views')}>
                  Vues <SortIcon active={sortKey === 'views'} asc={sortAsc} />
                </th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none"
                  style={{ color: 'var(--color-muted)' }}
                  onClick={() => toggleSort('contacts')}>
                  Contacts <SortIcon active={sortKey === 'contacts'} asc={sortAsc} />
                </th>
                <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none hidden sm:table-cell"
                  style={{ color: 'var(--color-muted)' }}
                  onClick={() => toggleSort('conversion')}>
                  Conversion <SortIcon active={sortKey === 'conversion'} asc={sortAsc} />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
              {sorted.map((row) => (
                <tr key={row.id} onClick={() => openDrawer(row)} className="cursor-pointer hover:bg-opacity-50 transition-colors" style={{
                  background: row.id === topId ? 'oklch(42% 0.09 155 / 0.04)' : 'var(--color-surface)',
                }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate max-w-[18ch]" style={{ color: 'var(--color-text)' }}>
                        {row.title}
                      </span>
                      {row.id === topId && (
                        <span className="shrink-0 text-xs px-1.5 py-0.5 rounded-full font-semibold"
                          style={{ background: 'oklch(42% 0.09 155 / 0.1)', color: 'var(--color-primary)' }}>
                          Top
                        </span>
                      )}
                    </div>
                    <p className="text-xs mt-0.5 truncate max-w-[22ch]" style={{ color: 'var(--color-muted)' }}>
                      {row.location}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--color-text)' }}>
                    {row.stats.total_views}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--color-text)' }}>
                    {row.stats.total_contacts}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums hidden sm:table-cell" style={{ color: 'var(--color-text)' }}>
                    {Math.min(100, row.stats.conversion_rate).toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats drawer */}
      {selectedRow && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedRow(null)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)' }} />
          <div className="relative w-full max-w-sm h-full shadow-2xl overflow-y-auto flex flex-col"
            style={{ background: 'var(--color-surface)' }}
            onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div>
                <p className="font-display font-semibold text-base leading-tight" style={{ color: 'var(--color-text)' }}>
                  {selectedRow.title}
                </p>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>{selectedRow.location}</p>
              </div>
              <button onClick={() => setSelectedRow(null)} className="ml-4 shrink-0 p-1 rounded-lg"
                style={{ color: 'var(--color-muted)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* KPIs */}
            <div className="grid grid-cols-3 gap-3 px-6 py-5">
              {[
                { label: 'Vues', value: selectedRow.stats.total_views },
                { label: 'Contacts', value: selectedRow.stats.total_contacts },
                { label: 'Conversion', value: `${Math.min(100, selectedRow.stats.conversion_rate).toFixed(1)}%` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'var(--color-bg)' }}>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-muted)' }}>{label}</p>
                  <p className="font-bold text-lg tabular-nums" style={{ color: 'var(--color-text)' }}>{value}</p>
                </div>
              ))}
            </div>
            {/* Trend */}
            <div className="px-6 pb-6 flex-1">
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
                Vues — 7 derniers jours
              </p>
              {trendLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                </div>
              ) : trend.length === 0 ? (
                <p className="text-sm py-4" style={{ color: 'var(--color-text-secondary)' }}>
                  Aucune donnée de tendance — disponible après le premier cycle d&apos;agrégation.
                </p>
              ) : (
                <ul className="space-y-2">
                  {trend.map(d => (
                    <li key={d.date} className="flex items-center justify-between text-sm">
                      <span style={{ color: 'var(--color-text-secondary)' }}>
                        {new Date(d.date).toLocaleDateString('fr-TN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </span>
                      <span className="tabular-nums font-medium" style={{ color: 'var(--color-text)' }}>
                        {d.views} vue{d.views !== 1 ? 's' : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
