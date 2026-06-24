'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth-context'
import { adminApi, adminAnalyticsApi, type Property, type AdminOverview, type AdminTopProperty, type AdminTopCity } from '@/lib/api'

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: 'Publié',    color: 'var(--color-primary)',        bg: 'oklch(32% 0.08 130 / 0.1)' },
  draft:     { label: 'Brouillon', color: 'var(--color-text-secondary)', bg: 'oklch(60% 0.014 70 / 0.1)' },
  sold:      { label: 'Vendu',     color: 'var(--color-accent)',         bg: 'oklch(58% 0.14 45 / 0.12)' },
  rented:    { label: 'Loué',      color: 'var(--color-accent)',         bg: 'oklch(58% 0.14 45 / 0.12)' },
}

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Appartement', villa: 'Villa', house: 'Maison',
  land: 'Terrain', commercial: 'Commercial', office: 'Bureau',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-muted)' }}>
      {text}
    </p>
  )
}

function KpiCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>
        {label}
      </p>
      <p className="font-display font-bold text-2xl tabular-nums" style={{ color: accent ?? 'var(--color-text)' }}>
        {value}
      </p>
    </div>
  )
}

function SectionHeader({ title, linkHref, linkLabel }: { title: string; linkHref?: string; linkLabel?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="font-display font-semibold text-base" style={{ color: 'var(--color-text)' }}>
        {title}
      </h2>
      {linkHref && (
        <Link href={linkHref} className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>
          {linkLabel ?? 'Voir tout'} →
        </Link>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { user } = useAuth()
  const firstName = user?.name?.split(' ')[0] ?? null

  const [properties,    setProperties]    = useState<Property[]>([])
  const [stats,         setStats]         = useState({ total_properties: 0, published: 0, drafts: 0 })
  const [totalUsers,    setTotalUsers]    = useState(0)
  const [overview,      setOverview]      = useState<AdminOverview | null>(null)
  const [topProperties, setTopProperties] = useState<AdminTopProperty[]>([])
  const [topCities,     setTopCities]     = useState<AdminTopCity[]>([])
  const [loading,       setLoading]       = useState(true)

  useEffect(() => {
    const propsPromise = adminApi.properties({ per_page: 5, sort: 'newest' })
      .then((r) => {
        setProperties(r.data.data)
        setStats({
          total_properties: r.data.total,
          published: r.data.data.filter((p: Property) => p.status === 'published').length,
          drafts:    r.data.data.filter((p: Property) => p.status === 'draft').length,
        })
      })
      .catch(() => {})

    const usersPromise      = adminApi.users({ per_page: 1 }).then((r) => setTotalUsers(r.data.total)).catch(() => {})
    const analyticsPromise  = adminAnalyticsApi.overview().then((r) => setOverview(r.data)).catch(() => {})
    const topPropsPromise   = adminAnalyticsApi.topProperties().then((r) => setTopProperties(r.data)).catch(() => {})
    const topCitiesPromise  = adminAnalyticsApi.topCities().then((r) => setTopCities(r.data)).catch(() => {})

    Promise.all([propsPromise, usersPromise, analyticsPromise, topPropsPromise, topCitiesPromise])
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="flex-1 px-6 py-8 max-w-5xl w-full">

      {/* ── Header ── */}
      <div className="mb-8">
        <SectionLabel text="Administration" />
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-text)' }}>
          {firstName ? `Bonjour, ${firstName}` : 'Tableau de bord'}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Vue d&apos;ensemble de la plateforme SAKAN.
        </p>
      </div>

      {/* ── Platform KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <KpiCard label="Biens publiés"  value={stats.published} />
        <KpiCard label="Brouillons"     value={stats.drafts}    accent="var(--color-text-secondary)" />
        <KpiCard label="Total biens"    value={stats.total_properties} />
        <KpiCard label="Utilisateurs"   value={totalUsers}      accent="var(--color-accent)" />
      </div>

      {/* ── Analytics KPIs (30-day) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Vues (30j)',      value: overview?.total_views    ?? '—' },
          { label: 'Contacts (30j)',  value: overview?.total_contacts ?? '—' },
          { label: 'Nouveaux users',  value: overview?.new_users      ?? '—' },
          { label: 'Taux conversion', value: overview ? `${Math.min(100, overview.conversion_rate).toFixed(1)}%` : '—' },
        ].map(({ label, value }) => (
          <KpiCard key={label} label={label} value={value} />
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="space-y-10">

          {/* ── Recent listings ── */}
          <section>
            <SectionHeader title="Annonces récentes" linkHref="/admin/annonces" linkLabel="Gérer" />
            <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--color-bg)' }}>
                    {['Titre', 'Type', 'Statut', 'Date'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                        style={{ color: 'var(--color-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                  {properties.map((p) => {
                    const s = STATUS_META[p.status] ?? STATUS_META.draft
                    return (
                      <tr key={p.id} className="transition-colors hover:bg-[var(--color-bg)]">
                        <td className="px-4 py-3.5 font-medium truncate max-w-[200px]" style={{ color: 'var(--color-text)' }}>
                          {p.title}
                        </td>
                        <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {TYPE_LABELS[p.property_type] ?? p.property_type}
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
                      </tr>
                    )
                  })}
                  {properties.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm italic" style={{ color: 'var(--color-muted)' }}>
                        Aucune annonce.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── Top properties by views ── */}
          {topProperties.length > 0 && (
            <section>
              <SectionHeader title="Top biens — 30 derniers jours" linkHref="/admin/analytics" linkLabel="Analytics" />
              <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'var(--color-bg)' }}>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>Bien</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>Type</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>Vues totales</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>Vues uniques</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    {topProperties.map((p) => (
                      <tr key={p.id} className="transition-colors hover:bg-[var(--color-bg)]">
                        <td className="px-4 py-3.5">
                          <p className="font-medium truncate max-w-[200px]" style={{ color: 'var(--color-text)' }}>{p.title}</p>
                        </td>
                        <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                          {TYPE_LABELS[p.property_type] ?? p.property_type}
                        </td>
                        <td className="px-4 py-3.5 text-right tabular-nums font-semibold" style={{ color: 'var(--color-text)' }}>{p.views_total}</td>
                        <td className="px-4 py-3.5 text-right tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>{p.views_unique}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── Top cities ── */}
          {topCities.length > 0 && (
            <section>
              <SectionHeader title="Villes les plus demandées" />
              <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: 'var(--color-bg)' }}>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>Ville</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>Vues</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>Biens publiés</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>Ratio D/O</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    {topCities.map((c) => (
                      <tr key={c.id} className="transition-colors hover:bg-[var(--color-bg)]">
                        <td className="px-4 py-3.5 font-medium" style={{ color: 'var(--color-text)' }}>{c.name}</td>
                        <td className="px-4 py-3.5 text-right tabular-nums" style={{ color: 'var(--color-text)' }}>{c.views_total}</td>
                        <td className="px-4 py-3.5 text-right tabular-nums" style={{ color: 'var(--color-text)' }}>{c.properties_published}</td>
                        <td className="px-4 py-3.5 text-right tabular-nums font-semibold" style={{ color: 'var(--color-primary)' }}>
                          {c.demand_supply_ratio.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

        </div>
      )}
    </main>
  )
}
