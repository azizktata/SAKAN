'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { StatsCard } from '@/components/espace-client/stats-card'
import { adminApi, adminAnalyticsApi, type Property, type AdminOverview, type AdminTopProperty, type AdminTopCity } from '@/lib/api'

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

export default function AdminPage() {
  const [properties, setProperties]       = useState<Property[]>([])
  const [stats, setStats]                 = useState({ total_properties: 0, published: 0, drafts: 0, total_users: 0 })
  const [totalUsers, setTotalUsers]       = useState(0)
  const [overview, setOverview]           = useState<AdminOverview | null>(null)
  const [topProperties, setTopProperties] = useState<AdminTopProperty[]>([])
  const [topCities, setTopCities]         = useState<AdminTopCity[]>([])
  const [loading, setLoading]             = useState(true)

  useEffect(() => {
    const statsPromise = adminApi.stats()
      .then((r) => setStats(r.data))
      .catch(() => null)

    const propsPromise = adminApi.properties({ per_page: 5, sort: 'newest' })
      .then((r) => {
        setProperties(r.data.data)
        statsPromise.then((s) => {
          if (s === null) {
            setStats((prev) => ({ ...prev, total_properties: r.data.total }))
          }
        })
      })
      .catch(() => {})

    const usersPromise = adminApi.users({ per_page: 1 })
      .then((r) => setTotalUsers(r.data.total))
      .catch(() => {})

    const analyticsPromise = adminAnalyticsApi.overview()
      .then((r) => setOverview(r.data))
      .catch(() => {})

    const topPropsPromise = adminAnalyticsApi.topProperties()
      .then((r) => setTopProperties(r.data))
      .catch(() => {})

    const topCitiesPromise = adminAnalyticsApi.topCities()
      .then((r) => setTopCities(r.data))
      .catch(() => {})

    Promise.all([statsPromise, propsPromise, usersPromise, analyticsPromise, topPropsPromise, topCitiesPromise])
      .finally(() => setLoading(false))
  }, [])

  const displayStats = {
    published:  stats.published  || properties.filter((p) => p.status === 'published').length,
    drafts:     stats.drafts     || properties.filter((p) => p.status === 'draft').length,
    total:      stats.total_properties,
    users:      stats.total_users || totalUsers,
  }

  return (
    <main className="flex-1 px-6 py-8 max-w-4xl w-full">
      <div className="mb-8">
        <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--color-text)' }}>
          Tableau de bord
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Vue d&apos;ensemble de la plateforme SAKAN.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <StatsCard label="Biens publiés"  value={displayStats.published} />
        <StatsCard label="Brouillons"     value={displayStats.drafts}    color="var(--color-text-secondary)" />
        <StatsCard label="Total biens"    value={displayStats.total} />
        <StatsCard label="Utilisateurs"   value={displayStats.users}     color="var(--color-accent)" />
      </div>

      {/* Analytics KPI row — 30-day engagement data */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Vues (30j)',      value: overview?.total_views       ?? '—' },
          { label: 'Contacts (30j)',  value: overview?.total_contacts    ?? '—' },
          { label: 'Nouveaux users',  value: overview?.new_users         ?? '—' },
          { label: 'Taux conversion', value: overview ? `${overview.conversion_rate.toFixed(1)}%` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-2xl p-4"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-muted)' }}>
              {label}
            </p>
            <p className="font-display font-bold text-xl tabular-nums" style={{ color: 'var(--color-text)' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <>
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold" style={{ color: 'var(--color-text)' }}>
                Annonces récentes
              </h2>
              <Link href="/admin/annonces" className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                Voir tout →
              </Link>
            </div>
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'oklch(96% 0.005 155)' }}>
                    {['Titre', 'Type', 'Statut', 'Date'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--color-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ background: 'var(--color-surface)' }}>
                  {properties.map((p) => {
                    const s = STATUS_META[p.status] ?? STATUS_META.draft
                    return (
                      <tr key={p.id}>
                        <td className="px-4 py-3 font-medium truncate max-w-[200px]" style={{ color: 'var(--color-text)' }}>
                          {p.title}
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                          {TYPE_LABELS[p.property_type] ?? p.property_type}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                            style={{ color: s.color, background: s.bg }}>
                            {s.label}
                          </span>
                        </td>
                        <td className="px-4 py-3" style={{ color: 'var(--color-muted)' }}>
                          {new Date(p.created_at).toLocaleDateString('fr-TN')}
                        </td>
                      </tr>
                    )
                  })}
                  {properties.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
                        Aucune annonce.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Top properties by views */}
          {topProperties.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                Top biens — 30 derniers jours
              </h2>
              <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'oklch(96% 0.005 155)' }}>
                      {['Bien', 'Type', 'Vues totales', 'Vues uniques'].map((h) => (
                        <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${h === 'Bien' ? 'text-left' : 'text-right'}`}
                          style={{ color: 'var(--color-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ background: 'var(--color-surface)' }}>
                    {topProperties.map((p) => (
                      <tr key={p.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium truncate max-w-[200px]" style={{ color: 'var(--color-text)' }}>{p.title}</p>
                        </td>
                        <td className="px-4 py-3 text-right" style={{ color: 'var(--color-text-secondary)' }}>
                          {TYPE_LABELS[p.property_type] ?? p.property_type}
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--color-text)' }}>{p.views_total}</td>
                        <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--color-text)' }}>{p.views_unique}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Top cities by demand */}
          {topCities.length > 0 && (
            <section className="mt-8">
              <h2 className="font-display font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                Villes les plus demandées
              </h2>
              <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'oklch(96% 0.005 155)' }}>
                      {['Ville', 'Vues', 'Biens publiés', 'Ratio demande/offre'].map((h) => (
                        <th key={h} className={`px-4 py-3 text-xs font-semibold uppercase tracking-wide ${h === 'Ville' ? 'text-left' : 'text-right'}`}
                          style={{ color: 'var(--color-muted)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ background: 'var(--color-surface)' }}>
                    {topCities.map((c) => (
                      <tr key={c.id}>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--color-text)' }}>{c.name}</td>
                        <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--color-text)' }}>{c.views_total}</td>
                        <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--color-text)' }}>{c.properties_published}</td>
                        <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--color-text)' }}>
                          {c.demand_supply_ratio.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  )
}
