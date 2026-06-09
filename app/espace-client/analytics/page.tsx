'use client'

import Image from 'next/image'
import { useEffect, useState, useCallback } from 'react'
import {
  analyticsApi, propertiesApi,
  type OwnerSummary, type PropertyStats, type DailyTrend, type Property,
} from '@/lib/api'
import type { ManagedProperty } from '@/components/espace-client/property-card-manage'
import { KpiCard }      from '@/components/espace-client/kpi-card'
import { PeriodToggle } from '@/components/espace-client/period-toggle'
import { LineChart }    from '@/components/espace-client/charts/line-chart'
import { BarChart }     from '@/components/espace-client/charts/bar-chart'
import { FunnelChart }  from '@/components/espace-client/charts/funnel-chart'
import { DonutChart }   from '@/components/espace-client/charts/donut-chart'
import { Sparkline }    from '@/components/espace-client/charts/sparkline'

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey = 'views' | 'contacts' | 'conversion'

type Row = {
  id:       string
  title:    string
  location: string
  price:    number
  mode:     'vente' | 'location'
  status:   ManagedProperty['status']
  image:    string
  property_type: string
  stats:    PropertyStats
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString('fr-TN') }

function fmtDuration(s: number | null) {
  if (s == null) return '—'
  if (s < 60) return `${Math.round(s)}s`
  const min = Math.floor(s / 60)
  const sec = Math.round(s % 60)
  return `${min}m ${sec}s`
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconEye()  { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> }
function IconUser() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> }
function IconMail() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> }
function IconClock(){ return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
function IconHome() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> }
function IconTrend(){ return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> }

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

// ─── Section card wrapper ──────────────────────────────────────────────────────

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl p-4 sm:p-5 ${className}`}
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      {children}
    </div>
  )
}

function SectionLabel({ text }: { text: string }) {
  return <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-muted)' }}>{text}</p>
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const [summary,         setSummary]         = useState<OwnerSummary | null>(null)
  const [properties,      setProperties]      = useState<Property[]>([])
  const [rows,            setRows]            = useState<Row[]>([])
  const [trend,           setTrend]           = useState<DailyTrend[]>([])
  const [trendLoading,    setTrendLoading]    = useState(false)
  const [loading,         setLoading]         = useState(true)
  const [selectedId,      setSelectedId]      = useState<string>('all')
  const [trendDays,       setTrendDays]       = useState<7 | 30>(7)
  const [sortKey,         setSortKey]         = useState<SortKey>('views')
  const [sortAsc,         setSortAsc]         = useState(false)
  const [drawerRow,       setDrawerRow]       = useState<Row | null>(null)

  // ── Trend fetch ──────────────────────────────────────────────────────────────
  const fetchTrend = useCallback((id: string | undefined, days: 7 | 30) => {
    if (!id) return
    setTrendLoading(true)
    analyticsApi.propertyTrend(id, days)
      .then(r => setTrend(r.data))
      .catch(() => setTrend([]))
      .finally(() => setTrendLoading(false))
  }, [])

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([
      analyticsApi.ownerSummary(),
      propertiesApi.myList(),
    ]).then(async ([sumRes, propsRes]) => {
      const sum   = sumRes.data
      const props = propsRes.data.data
      setSummary(sum)
      setProperties(props)

      const statsResults = await Promise.allSettled(
        props.map(p => analyticsApi.propertyStats(p.id).then(r => ({ id: p.id, stats: r.data })))
      )
      const statsMap: Record<string, PropertyStats> = {}
      statsResults.forEach(r => {
        if (r.status === 'fulfilled') statsMap[r.value.id] = r.value.stats
      })
      const built: Row[] = props.map(p => ({
        id:            p.id,
        title:         p.title,
        location:      p.location?.name ?? (p as { address?: string }).address ?? '—',
        price:         p.price,
        mode:          p.transaction_type === 'sale' ? 'vente' : 'location',
        status:        p.status as ManagedProperty['status'],
        image:         p.images?.find(i => i.is_cover)?.url ?? p.images?.[0]?.url ?? '',
        property_type: p.property_type ?? '',
        stats:         statsMap[p.id] ?? { total_views: 0, unique_views: 0, total_contacts: 0, conversion_rate: 0, period_stats: [] },
      }))
      setRows(built)

      // Fetch trend for top property (aggregate default)
      const topId = sum.top_property?.id ?? props[0]?.id
      if (topId) fetchTrend(topId, 7)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [fetchTrend])

  // ── Re-fetch trend on period or property change ───────────────────────────
  function handlePeriodChange(d: 7 | 30) {
    setTrendDays(d)
    const activeId = selectedId === 'all' ? (summary?.top_property?.id ?? properties[0]?.id) : selectedId
    fetchTrend(activeId, d)
  }

  function handlePropertyChange(id: string) {
    setSelectedId(id)
    const activeId = id === 'all' ? (summary?.top_property?.id ?? properties[0]?.id) : id
    fetchTrend(activeId, trendDays)
  }

  // ── Derived state ──────────────────────────────────────────────────────────
  const published = properties.filter(p => p.status === 'published').length
  const drafts    = properties.filter(p => p.status === 'draft').length
  const closed    = properties.filter(p => p.status === 'sold' || p.status === 'rented').length

  const topId     = summary?.top_property?.id
  const trendTitle = selectedId === 'all'
    ? (summary?.top_property?.title ? `Tendance — ${summary.top_property.title}` : 'Tendance')
    : (rows.find(r => r.id === selectedId)?.title ?? 'Tendance')

  const sorted = [...rows].sort((a, b) => {
    const av = sortKey === 'views' ? a.stats.total_views : sortKey === 'contacts' ? a.stats.total_contacts : a.stats.conversion_rate
    const bv = sortKey === 'views' ? b.stats.total_views : sortKey === 'contacts' ? b.stats.total_contacts : b.stats.conversion_rate
    return sortAsc ? av - bv : bv - av
  })

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(false) }
  }

  // ── Type distribution for donut ───────────────────────────────────────────
  const TYPE_COLORS: Record<string, string> = {
    Appartement: 'oklch(32% 0.08 130)',
    Villa:       'oklch(42% 0.12 155)',
    Maison:      'oklch(58% 0.14 45)',
    Terrain:     'oklch(68% 0.13 75)',
    Commercial:  'oklch(52% 0.10 250)',
    Bureau:      'oklch(60% 0.08 300)',
  }
  const typeCounts = rows.reduce<Record<string, number>>((acc, r) => {
    const t = r.property_type || 'Autre'
    acc[t] = (acc[t] ?? 0) + 1
    return acc
  }, {})
  const donutSlices = Object.entries(typeCounts).map(([label, value]) => ({
    label,
    value,
    color: TYPE_COLORS[label] ?? 'var(--color-muted)',
  }))

  // ── Country bar chart ─────────────────────────────────────────────────────
  const countryItems = (summary?.top_countries ?? []).map(({ country, views }) => ({
    label: country,
    value: views,
  }))

  // ── Leads this month ──────────────────────────────────────────────────────
  const thisMonthContacts = rows.reduce((sum, r) => sum + r.stats.total_contacts, 0)

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <main className="flex-1 flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
    </main>
  )

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl w-full">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="mb-8">
        <SectionLabel text="Tableau de bord" />
        <h1 className="font-display font-bold leading-tight"
          style={{ fontSize: 'clamp(1.5rem, 2.5vw, 2rem)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
          Statistiques
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Performance de {properties.length === 0 ? 'vos biens' : `vos ${properties.length} bien${properties.length > 1 ? 's' : ''}`}
        </p>
      </div>

      {/* ── Section 1: Executive KPIs ──────────────────────────────────────── */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <SectionLabel text="Résumé" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <KpiCard label="Annonces actives"   value={published} icon={<IconHome />} />
          <KpiCard label="Brouillons"          value={drafts}    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} color="var(--color-text-secondary)" />
          <KpiCard label="Vendus / Loués"      value={closed}    icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="var(--color-accent)" />
          <KpiCard label="Total annonces"      value={properties.length} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
          <KpiCard label="Vues totales"        value={fmt(summary?.total_views ?? 0)}        icon={<IconEye />} />
          <KpiCard label="Vues uniques"        value={fmt(summary?.total_unique_views ?? 0)} icon={<IconUser />} />
          <KpiCard label="Contacts reçus"      value={summary?.total_contacts ?? 0}          icon={<IconMail />} color="var(--color-accent)" />
          <KpiCard
            label="Taux de conversion"
            value={`${Math.min(100, summary?.avg_conversion_rate ?? 0).toFixed(1)}%`}
            icon={<IconTrend />}
            sub="contacts / vues uniques"
          />
        </div>
      </section>

      {/* ── Section 2: Visibilité & Trafic ────────────────────────────────── */}
      <section className="mb-10">
        <div className="mb-4">
          <SectionLabel text="Visibilité" />
          <h2 className="font-display font-semibold text-base" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
            Trafic & origines
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Trend chart — lg:col-span-2 */}
          <Card className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{trendTitle}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-muted)' }}>
                  Vues sur les {trendDays} derniers jours
                </p>
              </div>
              {/* Controls live here — they only affect this chart */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {properties.length > 0 && (
                  <select
                    value={selectedId}
                    onChange={e => handlePropertyChange(e.target.value)}
                    className="text-xs font-medium px-3 py-2 rounded-xl appearance-none cursor-pointer"
                    style={{
                      background:   'var(--color-bg)',
                      border:       '1px solid var(--color-border)',
                      color:        'var(--color-text)',
                      outlineColor: 'var(--color-primary)',
                    }}>
                    <option value="all">Toutes les annonces</option>
                    {properties.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                )}
                <PeriodToggle value={trendDays} onChange={handlePeriodChange} />
              </div>
            </div>
            {trendLoading ? (
              <div className="flex justify-center items-center" style={{ height: 160 }}>
                <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
              </div>
            ) : (
              <LineChart data={trend} height={160} />
            )}
          </Card>

          {/* Country bar */}
          <Card>
            <SectionLabel text="Origines" />
            <p className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
              Visiteurs par pays
            </p>
            {countryItems.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Données disponibles après le prochain cycle de tracking.
              </p>
            ) : (
              <BarChart items={countryItems} showPercent defaultColor="var(--color-primary)" />
            )}

            {/* Avg visit duration */}
            <div className="mt-5 pt-4 flex items-center gap-3"
              style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'var(--color-surface-warm)', color: 'var(--color-primary)' }}>
                <IconClock />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                  Durée moy. visite
                </p>
                <p className="font-display font-bold tabular-nums text-lg leading-none mt-0.5"
                  style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                  {fmtDuration(summary?.avg_duration_seconds ?? null)}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Section 3: Leads & Conversions ───────────────────────────────── */}
      <section className="mb-10">
        <div className="mb-4">
          <SectionLabel text="Conversion" />
          <h2 className="font-display font-semibold text-base" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
            Leads & entonnoir
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Funnel */}
          <Card>
            <SectionLabel text="Entonnoir de conversion" />
            <p className="font-semibold text-sm mb-5" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
              Vues → Contacts
            </p>
            <FunnelChart steps={[
              { label: 'Vues totales',   value: summary?.total_views        ?? 0 },
              { label: 'Vues uniques',   value: summary?.total_unique_views ?? 0 },
              { label: 'Contacts',       value: summary?.total_contacts     ?? 0 },
            ]} />
          </Card>

          {/* Leads KPI + per-property breakdown */}
          <Card>
            <SectionLabel text="Contacts" />
            <p className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
              Répartition des contacts
            </p>
            {rows.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucun bien publié.</p>
            ) : (
              <>
                {/* Total highlight */}
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-display font-bold tabular-nums"
                    style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                    {thisMonthContacts}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--color-muted)' }}>contact{thisMonthContacts !== 1 ? 's' : ''} total</span>
                </div>
                {/* Per-property bar */}
                <BarChart
                  items={rows
                    .filter(r => r.stats.total_contacts > 0)
                    .sort((a, b) => b.stats.total_contacts - a.stats.total_contacts)
                    .slice(0, 5)
                    .map(r => ({ label: r.title.slice(0, 20), value: r.stats.total_contacts }))}
                  defaultColor="var(--color-accent)"
                  showPercent
                />
                {rows.every(r => r.stats.total_contacts === 0) && (
                  <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucun contact reçu pour le moment.</p>
                )}
              </>
            )}
          </Card>
        </div>
      </section>

      {/* ── Section 4: Performance des biens ─────────────────────────────── */}
      <section>
        <div className="mb-4">
          <SectionLabel text="Biens" />
          <h2 className="font-display font-semibold text-base" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
            Performance des annonces
          </h2>
        </div>

        {rows.length === 0 ? (
          <Card>
            <p className="text-sm text-center py-8" style={{ color: 'var(--color-muted)' }}>
              Aucun bien publié pour le moment.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Sortable table — lg:col-span-2 */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                    <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Bien</th>
                    <th className="hidden sm:table-cell text-center px-3 py-3 font-semibold text-xs uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Tendance</th>
                    <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none" style={{ color: 'var(--color-muted)' }} onClick={() => toggleSort('views')}>
                      Vues <SortIcon active={sortKey === 'views'} asc={sortAsc} />
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none" style={{ color: 'var(--color-muted)' }} onClick={() => toggleSort('contacts')}>
                      Leads <SortIcon active={sortKey === 'contacts'} asc={sortAsc} />
                    </th>
                    <th className="text-right px-4 py-3 font-semibold text-xs uppercase tracking-wider cursor-pointer select-none hidden lg:table-cell" style={{ color: 'var(--color-muted)' }} onClick={() => toggleSort('conversion')}>
                      Conv. <SortIcon active={sortKey === 'conversion'} asc={sortAsc} />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                  {sorted.map((row) => (
                    <tr key={row.id} onClick={() => setDrawerRow(row)}
                      className="cursor-pointer transition-colors"
                      style={{ background: row.id === topId ? 'oklch(32% 0.08 130 / 0.04)' : 'var(--color-surface)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-warm)')}
                      onMouseLeave={e => (e.currentTarget.style.background = row.id === topId ? 'oklch(32% 0.08 130 / 0.04)' : 'var(--color-surface)')}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {/* Thumbnail */}
                          {row.image && (
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0"
                              style={{ background: 'var(--color-surface-warm)' }}>
                              <Image src={row.image} alt={row.title} fill sizes="32px" className="object-cover" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium truncate max-w-[15ch]" style={{ color: 'var(--color-text)' }}>
                                {row.title}
                              </span>
                              {row.id === topId && (
                                <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-semibold"
                                  style={{ background: 'oklch(32% 0.08 130 / 0.1)', color: 'var(--color-primary)' }}>
                                  Top
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] truncate max-w-[18ch]" style={{ color: 'var(--color-muted)' }}>
                              {row.location}
                            </p>
                          </div>
                        </div>
                      </td>
                      {/* Sparkline */}
                      <td className="hidden sm:table-cell px-3 py-3 text-center">
                        <Sparkline
                          data={(row.stats.period_stats ?? []).map(d => d.views)}
                          color="var(--color-primary)"
                        />
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums font-medium" style={{ color: 'var(--color-text)' }}>
                        {row.stats.total_views}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--color-text)' }}>
                        {row.stats.total_contacts}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums hidden lg:table-cell" style={{ color: 'var(--color-text)' }}>
                        {Math.min(100, row.stats.conversion_rate).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Property type donut */}
            <Card>
              <SectionLabel text="Répartition" />
              <p className="font-semibold text-sm mb-5" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                Types de biens
              </p>
              {donutSlices.length === 0 ? (
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucune donnée.</p>
              ) : (
                <DonutChart slices={donutSlices} size={104} />
              )}
            </Card>
          </div>
        )}
      </section>

      {/* ── Section 5: Audience & Répartition ────────────────────────────── */}
      {rows.length > 0 && (
        <section className="mt-10">
          <div className="mb-4">
            <SectionLabel text="Audience" />
            <h2 className="font-display font-semibold text-base" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
              Répartition des visiteurs
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Donut: vues par type de bien */}
            <Card>
              <SectionLabel text="Par type de bien" />
              <p className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                Vues par type
              </p>
              {(() => {
                const typeViews = rows.reduce<Record<string, number>>((acc, r) => {
                  const t = r.property_type || 'Autre'
                  acc[t] = (acc[t] ?? 0) + r.stats.total_views
                  return acc
                }, {})
                const TYPE_COLORS: Record<string, string> = {
                  Appartement: 'oklch(32% 0.08 130)',
                  Villa:       'oklch(42% 0.12 155)',
                  Maison:      'oklch(58% 0.14 45)',
                  Terrain:     'oklch(68% 0.13 75)',
                  Commercial:  'oklch(52% 0.10 250)',
                  Bureau:      'oklch(60% 0.08 300)',
                  Autre:       'var(--color-muted)',
                }
                const slices = Object.entries(typeViews)
                  .filter(([, v]) => v > 0)
                  .map(([label, value]) => ({ label, value, color: TYPE_COLORS[label] ?? 'var(--color-muted)' }))
                return slices.length > 0
                  ? <DonutChart slices={slices} size={100} />
                  : <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucune vue enregistrée.</p>
              })()}
            </Card>

            {/* Donut: vues par localisation */}
            <Card>
              <SectionLabel text="Par localisation" />
              <p className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                Vues par ville
              </p>
              {(() => {
                const locViews = rows.reduce<Record<string, number>>((acc, r) => {
                  const loc = r.location || 'Autre'
                  acc[loc] = (acc[loc] ?? 0) + r.stats.total_views
                  return acc
                }, {})
                const LOCATION_HUES = [130, 155, 45, 75, 250, 300, 200, 30, 180, 340]
                const slices = Object.entries(locViews)
                  .filter(([, v]) => v > 0)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 7)
                  .map(([label, value], i) => ({
                    label,
                    value,
                    color: `oklch(${[42, 52, 58, 65, 48, 60, 55][i % 7]}% ${[0.10, 0.12, 0.14, 0.09, 0.11, 0.08, 0.13][i % 7]} ${LOCATION_HUES[i % 10]})`,
                  }))
                return slices.length > 0
                  ? <DonutChart slices={slices} size={100} />
                  : <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucune vue enregistrée.</p>
              })()}
            </Card>

            {/* Bar chart: vues par transaction (vente vs location) */}
            <Card>
              <SectionLabel text="Par transaction" />
              <p className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                Vente vs Location
              </p>
              {(() => {
                const venteViews  = rows.filter(r => r.mode === 'vente').reduce((s, r) => s + r.stats.total_views, 0)
                const locViews    = rows.filter(r => r.mode === 'location').reduce((s, r) => s + r.stats.total_views, 0)
                const totalTx     = venteViews + locViews
                if (totalTx === 0) return <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucune donnée.</p>
                return (
                  <>
                    <BarChart
                      items={[
                        { label: 'Vente',    value: venteViews, color: 'var(--color-primary)' },
                        { label: 'Location', value: locViews,   color: 'var(--color-accent)'  },
                      ]}
                      showPercent
                    />
                    {/* Vente vs Location donut-style visual below */}
                    <div className="mt-5 pt-4 space-y-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
                        Vues totales
                      </p>
                      {[
                        { label: 'Vente',    value: venteViews,  color: 'var(--color-primary)' },
                        { label: 'Location', value: locViews,    color: 'var(--color-accent)'  },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                          </div>
                          <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>{fmt(value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )
              })()}
            </Card>

            {/* Bar chart: top biens par vues (horizontal ranking) */}
            <Card className="lg:col-span-2">
              <SectionLabel text="Classement" />
              <p className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                Top biens par nombre de vues
              </p>
              {(() => {
                const ranked = [...rows]
                  .sort((a, b) => b.stats.total_views - a.stats.total_views)
                  .slice(0, 6)
                  .map(r => ({ label: r.title.slice(0, 28), value: r.stats.total_views }))
                return ranked.length > 0
                  ? <BarChart items={ranked} showPercent defaultColor="var(--color-primary)" />
                  : <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucune donnée.</p>
              })()}
            </Card>

            {/* Price range bar chart */}
            <Card>
              <SectionLabel text="Prix" />
              <p className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                Vues par tranche de prix
              </p>
              {(() => {
                const brackets: [string, (p: number) => boolean][] = [
                  ['< 150k',       p => p < 150_000],
                  ['150–350k',     p => p >= 150_000 && p < 350_000],
                  ['350–700k',     p => p >= 350_000 && p < 700_000],
                  ['> 700k',       p => p >= 700_000],
                ]
                const items = brackets.map(([label, test]) => ({
                  label,
                  value: rows.filter(r => test(r.price)).reduce((s, r) => s + r.stats.total_views, 0),
                })).filter(i => i.value > 0)
                return items.length > 0
                  ? <BarChart items={items} showPercent defaultColor="oklch(68% 0.13 75)" />
                  : <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucune vue enregistrée.</p>
              })()}
            </Card>

          </div>
        </section>
      )}

      {/* ── Stats drawer ──────────────────────────────────────────────────── */}
      {drawerRow && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDrawerRow(null)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
          <div className="relative w-full max-w-sm h-full shadow-2xl overflow-y-auto flex flex-col"
            style={{ background: 'var(--color-surface)' }}
            onClick={e => e.stopPropagation()}>
            {/* Drawer header */}
            <div className="flex items-start justify-between px-5 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-3 min-w-0">
                {drawerRow.image && (
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0"
                    style={{ background: 'var(--color-surface-warm)' }}>
                    <Image src={drawerRow.image} alt={drawerRow.title} fill sizes="40px" className="object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm leading-tight truncate" style={{ color: 'var(--color-text)' }}>
                    {drawerRow.title}
                  </p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>{drawerRow.location}</p>
                </div>
              </div>
              <button onClick={() => setDrawerRow(null)} className="ml-3 shrink-0 p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--color-muted)', background: 'var(--color-bg)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer KPIs */}
            <div className="grid grid-cols-3 gap-2 px-5 py-4">
              {[
                { label: 'Vues',       value: drawerRow.stats.total_views },
                { label: 'Contacts',   value: drawerRow.stats.total_contacts },
                { label: 'Conversion', value: `${Math.min(100, drawerRow.stats.conversion_rate).toFixed(1)}%` },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl p-3 text-center" style={{ background: 'var(--color-bg)' }}>
                  <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-muted)' }}>{label}</p>
                  <p className="font-display font-bold text-base tabular-nums" style={{ color: 'var(--color-text)' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Trend chart in drawer */}
            <div className="px-5 pb-6 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--color-muted)' }}>
                Vues — {trendDays} derniers jours
              </p>
              {drawerRow.stats.period_stats && drawerRow.stats.period_stats.length > 0 ? (
                <LineChart data={drawerRow.stats.period_stats} height={140} />
              ) : (
                <p className="text-xs py-4" style={{ color: 'var(--color-text-secondary)' }}>
                  Données disponibles après le premier cycle d&apos;agrégation.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
