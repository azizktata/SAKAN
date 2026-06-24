'use client'

import Image from 'next/image'
import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import {
  analyticsApi, propertiesApi,
  type OwnerSummary, type PropertyStats, type DailyTrend, type Property,
} from '@/lib/api'
import type { ManagedProperty } from '@/components/espace-client/property-card-manage'
import { KpiCard }      from '@/components/espace-client/kpi-card'
import { LineChart }    from '@/components/espace-client/charts/line-chart'
import { BarChart }     from '@/components/espace-client/charts/bar-chart'
import { FunnelChart }  from '@/components/espace-client/charts/funnel-chart'
import { DonutChart }   from '@/components/espace-client/charts/donut-chart'
import { Sparkline }    from '@/components/espace-client/charts/sparkline'

// ─── Types ────────────────────────────────────────────────────────────────────

type SortKey  = 'views' | 'contacts' | 'conversion'
type TimeRange = 7 | 30 | 90 | 'all'

type Row = {
  id:            string
  title:         string
  location:      string
  price:         number
  mode:          'vente' | 'location'
  status:        ManagedProperty['status']
  image:         string
  property_type: string
  stats:         PropertyStats
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) { return n.toLocaleString('fr-TN') }

const TYPE_LABEL_MAP: Record<string, string> = {
  apartment:  'Appartement',
  villa:      'Villa',
  house:      'Maison',
  land:       'Terrain',
  commercial: 'Commercial',
  office:     'Bureau',
}

function normalizeType(raw: string): string {
  return TYPE_LABEL_MAP[raw?.toLowerCase()] ?? (raw || 'Autre')
}

function fmtDuration(s: number | null) {
  if (s == null) return '—'
  if (s < 60) return `${Math.round(s)}s`
  const min = Math.floor(s / 60)
  const sec = Math.round(s % 60)
  return `${min}m ${sec}s`
}

// Slice period_stats to last N days and return summed counts
function slicedStats(stats: PropertyStats, days: TimeRange) {
  if (days === 'all') {
    return {
      views:    stats.total_views,
      unique:   stats.unique_views,
      contacts: stats.total_contacts,
      rate:     stats.conversion_rate,
      trend:    stats.period_stats ?? [],
    }
  }
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)
  const sliced = (stats.period_stats ?? []).filter(d => new Date(d.date) >= cutoff)
  return {
    views:    sliced.reduce((s, d) => s + d.views, 0),
    unique:   sliced.reduce((s, d) => s + (d.unique_views ?? 0), 0),
    contacts: stats.total_contacts,
    rate:     stats.conversion_rate,
    trend:    sliced,
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function IconEye()    { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> }
function IconUser()   { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> }
function IconMail()   { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> }
function IconClock()  { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
function IconHome()   { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> }
function IconTrend()  { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> }
function IconPin()    { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> }

function SortIcon({ active, asc }: { active: boolean; asc: boolean }) {
  return (
    <svg className="w-3.5 h-3.5 ml-0.5 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ opacity: active ? 1 : 0.3 }}>
      {asc
        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />}
    </svg>
  )
}

// ─── Shared UI primitives ──────────────────────────────────────────────────────

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

// Time range toggle — used inline inside sections
const TIME_OPTIONS: { label: string; value: TimeRange }[] = [
  { label: '7j',   value: 7 },
  { label: '30j',  value: 30 },
  { label: '90j',  value: 90 },
  { label: 'Tout', value: 'all' },
]

function TimeToggle({ value, onChange }: { value: TimeRange; onChange: (v: TimeRange) => void }) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-xl shrink-0"
      style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
      {TIME_OPTIONS.map(({ label, value: v }) => (
        <button key={v} onClick={() => onChange(v)}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
          style={value === v
            ? { background: 'var(--color-primary)', color: '#fff' }
            : { color: 'var(--color-text-secondary)', background: 'transparent' }}>
          {label}
        </button>
      ))}
    </div>
  )
}

// Section header with optional right slot
function SectionHeader({ label, title, right }: { label: string; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4 gap-3">
      <div>
        <SectionLabel text={label} />
        <h2 className="font-display font-semibold text-base" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{title}</h2>
      </div>
      {right}
    </div>
  )
}

const TABLE_PAGE_SIZE = 14

// TYPE colours
const TYPE_COLORS: Record<string, string> = {
  Appartement: 'oklch(32% 0.08 130)',
  Villa:       'oklch(42% 0.12 155)',
  Maison:      'oklch(58% 0.14 45)',
  Terrain:     'oklch(68% 0.13 75)',
  Commercial:  'oklch(52% 0.10 250)',
  Bureau:      'oklch(60% 0.08 300)',
}
const LOCATION_HUES = [130, 155, 45, 75, 250, 300, 200]

// ─── Main page ─────────────────────────────────────────────────────────────────

const EMPTY_STATS: PropertyStats = { total_views: 0, unique_views: 0, total_contacts: 0, conversion_rate: 0, period_stats: [] }

export default function AnalyticsPage() {
  // ── Raw data ─────────────────────────────────────────────────────────────────
  const [summary,      setSummary]      = useState<OwnerSummary | null>(null)
  const [properties,   setProperties]   = useState<Property[]>([])
  const [rows,         setRows]         = useState<Row[]>([])
  const [loading,      setLoading]      = useState(true)

  // Stats cache — fetched on demand, never refetched for already-loaded ids
  const statsCache = useRef<Record<string, PropertyStats>>({})

  // ── Trend chart (Visibilité section) ─────────────────────────────────────────
  const [trend,        setTrend]        = useState<DailyTrend[]>([])
  const [trendLoading, setTrendLoading] = useState(false)
  const [trendPropId,  setTrendPropId]  = useState<string>('all')
  const [trendDays,    setTrendDays]    = useState<7 | 30>(7)

  // ── KPI section time range ────────────────────────────────────────────────────
  const [kpiTime, setKpiTime] = useState<TimeRange>('all')

  // ── Audience section ─────────────────────────────────────────────────────────
  const [audienceMetric, setAudienceMetric] = useState<'views' | 'leads'>('views')
  const [audienceTime,   setAudienceTime]   = useState<TimeRange>('all')

  // ── Conversion section ────────────────────────────────────────────────────────
  const [convTime, setConvTime] = useState<TimeRange>('all')

  // ── Property section (new) ────────────────────────────────────────────────────
  const [propFilterId,  setPropFilterId]  = useState<string>('')
  const [propDays,      setPropDays]      = useState<7 | 30>(7)
  const [propTrend,     setPropTrend]     = useState<DailyTrend[]>([])
  const [propTrendLoad, setPropTrendLoad] = useState(false)
  const [propStatsLoad, setPropStatsLoad] = useState(false)

  // ── Location section (new) ────────────────────────────────────────────────────
  const [locFilter,  setLocFilter]  = useState<string>('')
  const [locMetric,  setLocMetric]  = useState<'views' | 'leads'>('views')
  const [locTime,    setLocTime]    = useState<TimeRange>('all')

  // ── Performance table ─────────────────────────────────────────────────────────
  const [sortKey,    setSortKey]    = useState<SortKey>('views')
  const [sortAsc,    setSortAsc]    = useState(false)
  const [tablePage,  setTablePage]  = useState(1)
  const [drawerRow,  setDrawerRow]  = useState<Row | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)

  // ── Fetch stats for a batch of property ids, merge into rows + cache ──────────
  const fetchStatsForIds = useCallback(async (ids: string[]) => {
    const missing = ids.filter(id => !(id in statsCache.current))
    if (missing.length === 0) return
    setStatsLoading(true)
    const results = await Promise.allSettled(
      missing.map(id => analyticsApi.propertyStats(id).then(r => ({ id, stats: r.data as PropertyStats })))
    )
    results.forEach(r => { if (r.status === 'fulfilled') statsCache.current[r.value.id] = r.value.stats })
    setRows(prev => prev.map(row => ({
      ...row,
      stats: statsCache.current[row.id] ?? row.stats,
    })))
    setStatsLoading(false)
  }, [])

  // ── Fetch trend for Visibilité section ────────────────────────────────────────
  const fetchTrend = useCallback((id: string | undefined, days: 7 | 30) => {
    if (!id) return
    setTrendLoading(true)
    analyticsApi.propertyTrend(id, days)
      .then(r => setTrend(r.data))
      .catch(() => setTrend([]))
      .finally(() => setTrendLoading(false))
  }, [])

  // ── Fetch trend for per-property section ──────────────────────────────────────
  const fetchPropTrend = useCallback((id: string, days: 7 | 30) => {
    setPropTrendLoad(true)
    analyticsApi.propertyTrend(id, days)
      .then(r => setPropTrend(r.data))
      .catch(() => setPropTrend([]))
      .finally(() => setPropTrendLoad(false))
  }, [])

  // ── Initial load — only summary + property list, no stats yet ─────────────────
  useEffect(() => {
    Promise.all([
      analyticsApi.ownerSummary(),
      propertiesApi.myList(),
    ]).then(([sumRes, propsRes]) => {
      const sum   = sumRes.data
      const props = propsRes.data.data
      setSummary(sum)
      setProperties(props)

      // Build rows immediately with empty stats — table renders right away
      const built: Row[] = props.map(p => ({
        id:            p.id,
        title:         p.title,
        location:      p.location?.name ?? (p as { address?: string }).address ?? '—',
        price:         p.price,
        mode:          p.transaction_type === 'sale' ? 'vente' : 'location',
        status:        p.status as ManagedProperty['status'],
        image:         p.images?.find(i => i.is_cover)?.url ?? p.images?.[0]?.url ?? '',
        property_type: p.property_type ?? '',
        stats:         EMPTY_STATS,
      }))
      setRows(built)

      // Auto-select first property for the deep-dive section
      const firstPropId = props[0]?.id ? String(props[0].id) : ''
      if (firstPropId) {
        setPropFilterId(firstPropId)
        fetchPropTrend(firstPropId, 7)
        // Fetch stats for it immediately
        analyticsApi.propertyStats(firstPropId)
          .then(r => { statsCache.current[firstPropId] = r.data as PropertyStats })
          .catch(() => {})
      }

      const topId = sum.top_property?.id ?? props[0]?.id
      if (topId) fetchTrend(String(topId), 7)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [fetchTrend, fetchPropTrend])

  // ── Fetch stats for currently visible table page ──────────────────────────────
  // Called whenever sorted order or page changes — deferred so sort state settles first
  const fetchCurrentPageStats = useCallback((sortedIds: string[]) => {
    const pageIds = sortedIds.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE)
    fetchStatsForIds(pageIds)
  }, [tablePage, fetchStatsForIds])

  // ── Trend section handlers ─────────────────────────────────────────────────────
  function handleTrendDays(d: 7 | 30) {
    setTrendDays(d)
    const id = trendPropId === 'all' ? (summary?.top_property?.id ?? properties[0]?.id) : trendPropId
    fetchTrend(String(id), d)
  }
  function handleTrendProp(id: string) {
    setTrendPropId(id)
    const activeId = id === 'all' ? (summary?.top_property?.id ?? properties[0]?.id) : id
    fetchTrend(String(activeId), trendDays)
  }

  // ── Property section handlers ──────────────────────────────────────────────────
  function handlePropSelect(id: string) {
    setPropFilterId(id)
    if (id) {
      // Fetch stats for this property if not cached yet
      if (!(id in statsCache.current)) {
        setPropStatsLoad(true)
        analyticsApi.propertyStats(id)
          .then(r => {
            statsCache.current[id] = r.data as PropertyStats
            setRows(prev => prev.map(row => String(row.id) === id ? { ...row, stats: statsCache.current[id] } : row))
          })
          .catch(() => {})
          .finally(() => setPropStatsLoad(false))
      }
      fetchPropTrend(id, propDays)
    }
  }
  function handlePropDays(d: 7 | 30) {
    setPropDays(d)
    if (propFilterId) fetchPropTrend(propFilterId, d)
  }

  // ── Derived: unique locations list ────────────────────────────────────────────
  const locations = useMemo(() => {
    const seen = new Set<string>()
    rows.forEach(r => { if (r.location && r.location !== '—') seen.add(r.location) })
    return Array.from(seen).sort()
  }, [rows])

  // Auto-select first city once locations are derived
  useEffect(() => {
    if (locations.length > 0 && !locFilter) setLocFilter(locations[0])
  }, [locations, locFilter])

  // ── Derived: rows for location section ────────────────────────────────────────
  const locRows = useMemo(
    () => locFilter ? rows.filter(r => r.location === locFilter) : [],
    [rows, locFilter]
  )

  // ── KPI aggregates — use ownerSummary for "all" (avoids waiting for lazy stats)
  const kpiAgg = useMemo(() => {
    if (kpiTime === 'all' && summary) {
      return {
        views:    summary.total_views,
        unique:   summary.total_unique_views,
        contacts: summary.total_contacts,
        rate:     summary.avg_conversion_rate,
      }
    }
    const slices = rows.map(r => slicedStats(r.stats, kpiTime))
    return {
      views:    slices.reduce((s, d) => s + d.views, 0),
      unique:   slices.reduce((s, d) => s + d.unique, 0),
      contacts: slices.reduce((s, d) => s + d.contacts, 0),
      rate:     slices.length > 0 ? slices.reduce((s, d) => s + d.rate, 0) / slices.length : 0,
    }
  }, [rows, kpiTime, summary])

  // ── Conversion aggregates — use ownerSummary for "all"
  const convAgg = useMemo(() => {
    if (convTime === 'all' && summary) {
      return { views: summary.total_views, unique: summary.total_unique_views, contacts: summary.total_contacts }
    }
    const slices = rows.map(r => slicedStats(r.stats, convTime))
    return {
      views:    slices.reduce((s, d) => s + d.views, 0),
      unique:   slices.reduce((s, d) => s + d.unique, 0),
      contacts: slices.reduce((s, d) => s + d.contacts, 0),
    }
  }, [rows, convTime, summary])

  // ── Per-property selected row ──────────────────────────────────────────────────
  const propRow = useMemo(() => rows.find(r => String(r.id) === propFilterId) ?? null, [rows, propFilterId])

  // ── Performance table sort ─────────────────────────────────────────────────────
  const published = properties.filter(p => p.status === 'published').length
  const drafts    = properties.filter(p => p.status === 'draft').length
  const closed    = properties.filter(p => p.status === 'sold' || p.status === 'rented').length
  const topId     = summary?.top_property?.id != null ? String(summary.top_property.id) : undefined

  const sorted = [...rows].sort((a, b) => {
    const av = sortKey === 'views' ? a.stats.total_views : sortKey === 'contacts' ? a.stats.total_contacts : a.stats.conversion_rate
    const bv = sortKey === 'views' ? b.stats.total_views : sortKey === 'contacts' ? b.stats.total_contacts : b.stats.conversion_rate
    return sortAsc ? av - bv : bv - av
  })
  const totalTablePages  = Math.ceil(sorted.length / TABLE_PAGE_SIZE)
  const pagedRows        = sorted.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE)
  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(a => !a)
    else { setSortKey(key); setSortAsc(false); setTablePage(1) }
  }

  // ── Lazy-load stats for the current table page whenever it changes ─────────────
  useEffect(() => {
    if (rows.length === 0) return
    const ids = rows.map(r => String(r.id))
    const pageIds = ids.slice((tablePage - 1) * TABLE_PAGE_SIZE, tablePage * TABLE_PAGE_SIZE)
    fetchStatsForIds(pageIds)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows.length, tablePage, fetchStatsForIds])

  // ── Type donut (performance section) ──────────────────────────────────────────
  const donutSlices = useMemo(() => {
    const counts = rows.reduce<Record<string, number>>((acc, r) => {
      const t = normalizeType(r.property_type); acc[t] = (acc[t] ?? 0) + 1; return acc
    }, {})
    return Object.entries(counts).map(([label, value]) => ({ label, value, color: TYPE_COLORS[label] ?? 'var(--color-muted)' }))
  }, [rows])

  // ── Audience charts derived data ───────────────────────────────────────────────
  const audienceTypeData = useMemo(() => {
    const d = rows.reduce<Record<string, number>>((acc, r) => {
      const t = normalizeType(r.property_type)
      const s = slicedStats(r.stats, audienceTime)
      acc[t] = (acc[t] ?? 0) + (audienceMetric === 'views' ? s.views : s.contacts)
      return acc
    }, {})
    return Object.entries(d).filter(([, v]) => v > 0)
      .map(([label, value]) => ({ label, value, color: TYPE_COLORS[label] ?? 'var(--color-muted)' }))
  }, [rows, audienceMetric, audienceTime])

  const audienceLocData = useMemo(() => {
    const d = rows.reduce<Record<string, number>>((acc, r) => {
      const loc = r.location || 'Autre'
      const s   = slicedStats(r.stats, audienceTime)
      acc[loc]  = (acc[loc] ?? 0) + (audienceMetric === 'views' ? s.views : s.contacts)
      return acc
    }, {})
    return Object.entries(d).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]).slice(0, 7)
      .map(([label, value], i) => ({
        label, value,
        color: `oklch(${[42,52,58,65,48,60,55][i%7]}% ${[0.10,0.12,0.14,0.09,0.11,0.08,0.13][i%7]} ${LOCATION_HUES[i%7]})`,
      }))
  }, [rows, audienceMetric, audienceTime])

  // ── Country / city bar data ────────────────────────────────────────────────────
  const countryItems  = (summary?.top_countries ?? []).map(({ country, views }) => ({ label: country, value: views }))
  const citiesTnItems = (summary?.top_cities_tn ?? []).map(({ city_geo, views }) => ({ label: city_geo, value: views }))

  // ── Loading ────────────────────────────────────────────────────────────────────
  if (loading) return (
    <main className="flex-1 flex items-center justify-center py-20">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
    </main>
  )

  const trendTitle = trendPropId === 'all'
    ? (summary?.top_property?.title ? `Tendance — ${summary.top_property.title}` : 'Tendance')
    : (rows.find(r => String(r.id) === trendPropId)?.title ?? 'Tendance')

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl w-full">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
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

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 1 — KPI résumé (with time range filter)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <SectionHeader
          label="Résumé"
          title="Indicateurs clés"
          right={<TimeToggle value={kpiTime} onChange={setKpiTime} />}
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <KpiCard label="Annonces actives"  value={published}       icon={<IconHome />} />
          <KpiCard label="Brouillons"         value={drafts}          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} color="var(--color-text-secondary)" />
          <KpiCard label="Vendus / Loués"     value={closed}          icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} color="var(--color-accent)" />
          <KpiCard label="Total annonces"     value={properties.length} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
          <KpiCard label="Vues totales"       value={fmt(kpiAgg.views)}   icon={<IconEye />} />
          <KpiCard label="Vues uniques"       value={fmt(kpiAgg.unique)}  icon={<IconUser />} />
          <KpiCard label="Contacts reçus"     value={kpiAgg.contacts}     icon={<IconMail />} color="var(--color-accent)" />
          <KpiCard label="Taux de conversion" value={`${Math.min(100, kpiAgg.rate).toFixed(1)}%`} icon={<IconTrend />} sub="contacts / vues uniques" />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 2 — Audience (with time range + views/leads toggle)
      ═══════════════════════════════════════════════════════════════════════ */}
      {rows.length > 0 && (
        <section className="mb-10">
          <SectionHeader
            label="Audience"
            title="Répartition des visiteurs"
            right={
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <TimeToggle value={audienceTime} onChange={setAudienceTime} />
                <div className="flex items-center rounded-xl overflow-hidden"
                  style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
                  {(['views', 'leads'] as const).map(m => (
                    <button key={m} onClick={() => setAudienceMetric(m)}
                      className="px-3 py-1.5 text-xs font-semibold transition-colors"
                      style={{ background: audienceMetric === m ? 'var(--color-primary)' : 'transparent', color: audienceMetric === m ? '#fff' : 'var(--color-text-secondary)' }}>
                      {m === 'views' ? 'Vues' : 'Leads'}
                    </button>
                  ))}
                </div>
              </div>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {/* Donut: par type */}
            <Card>
              <SectionLabel text="Par type de bien" />
              <p className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>
                {audienceMetric === 'views' ? 'Vues par type' : 'Leads par type'}
              </p>
              {audienceTypeData.length > 0
                ? <DonutChart slices={audienceTypeData} size={100} centerLabel={audienceMetric === 'views' ? 'vues' : 'leads'} />
                : <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucune donnée.</p>}
            </Card>

            {/* Donut: par ville */}
            <Card>
              <SectionLabel text="Par localisation" />
              <p className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>
                {audienceMetric === 'views' ? 'Vues par ville' : 'Leads par ville'}
              </p>
              {audienceLocData.length > 0
                ? <DonutChart slices={audienceLocData} size={100} centerLabel={audienceMetric === 'views' ? 'vues' : 'leads'} />
                : <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucune donnée.</p>}
            </Card>

            {/* Bar: vente vs location */}
            <Card>
              <SectionLabel text="Par transaction" />
              <p className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>Vente vs Location</p>
              {(() => {
                const venteVal = rows.filter(r => r.mode === 'vente').reduce((s, r) => { const sl = slicedStats(r.stats, audienceTime); return s + (audienceMetric === 'views' ? sl.views : sl.contacts) }, 0)
                const locVal   = rows.filter(r => r.mode === 'location').reduce((s, r) => { const sl = slicedStats(r.stats, audienceTime); return s + (audienceMetric === 'views' ? sl.views : sl.contacts) }, 0)
                if (venteVal + locVal === 0) return <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucune donnée.</p>
                return (
                  <>
                    <BarChart items={[{ label: 'Vente', value: venteVal, color: 'var(--color-primary)' }, { label: 'Location', value: locVal, color: 'var(--color-accent)' }]} showPercent />
                    <div className="mt-5 pt-4 space-y-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                      <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>Total</p>
                      {[{ label: 'Vente', value: venteVal, color: 'var(--color-primary)' }, { label: 'Location', value: locVal, color: 'var(--color-accent)' }].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center justify-between">
                          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: color }} /><span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{label}</span></div>
                          <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>{fmt(value)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )
              })()}
            </Card>

            {/* Bar: top biens */}
            <Card className="lg:col-span-2">
              <SectionLabel text="Classement" />
              <p className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>
                {audienceMetric === 'views' ? 'Top biens par vues' : 'Top biens par leads'}
              </p>
              {(() => {
                const ranked = [...rows]
                  .map(r => { const s = slicedStats(r.stats, audienceTime); return { label: r.title.slice(0, 28), value: audienceMetric === 'views' ? s.views : s.contacts } })
                  .sort((a, b) => b.value - a.value).slice(0, 6)
                return ranked.some(r => r.value > 0)
                  ? <BarChart items={ranked} showPercent defaultColor="var(--color-primary)" />
                  : <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucune donnée.</p>
              })()}
            </Card>

            {/* Bar: par tranche de prix */}
            <Card>
              <SectionLabel text="Prix" />
              <p className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>
                {audienceMetric === 'views' ? 'Vues par tranche' : 'Leads par tranche'}
              </p>
              {(() => {
                const brackets: [string, (p: number) => boolean][] = [
                  ['< 150k', p => p < 150_000],
                  ['150–350k', p => p >= 150_000 && p < 350_000],
                  ['350–700k', p => p >= 350_000 && p < 700_000],
                  ['> 700k', p => p >= 700_000],
                ]
                const items = brackets.map(([label, test]) => ({
                  label,
                  value: rows.filter(r => test(r.price)).reduce((s, r) => { const sl = slicedStats(r.stats, audienceTime); return s + (audienceMetric === 'views' ? sl.views : sl.contacts) }, 0),
                })).filter(i => i.value > 0)
                return items.length > 0
                  ? <BarChart items={items} showPercent defaultColor="oklch(68% 0.13 75)" />
                  : <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucune vue enregistrée.</p>
              })()}
            </Card>

          </div>
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 3 — Performance table
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <SectionHeader label="Biens" title="Performance des annonces" />

        {rows.length === 0 ? (
          <Card><p className="text-sm text-center py-8" style={{ color: 'var(--color-muted)' }}>Aucun bien publié pour le moment.</p></Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Table */}
            <div className="lg:col-span-2 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[400px]">
                  <thead>
                    <tr style={{ background: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)' }}>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Bien</th>
                      <th className="hidden sm:table-cell text-center px-3 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-muted)' }}>Tendance</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none" style={{ color: 'var(--color-muted)' }} onClick={() => toggleSort('views')}>Vues <SortIcon active={sortKey === 'views'} asc={sortAsc} /></th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none" style={{ color: 'var(--color-muted)' }} onClick={() => toggleSort('contacts')}>Leads <SortIcon active={sortKey === 'contacts'} asc={sortAsc} /></th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hidden lg:table-cell" style={{ color: 'var(--color-muted)' }} onClick={() => toggleSort('conversion')}>
                        Conv. <SortIcon active={sortKey === 'conversion'} asc={sortAsc} />
                        {statsLoading && <span className="ml-1 inline-block w-2 h-2 rounded-full border border-t-transparent animate-spin align-middle" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
                    {pagedRows.map(row => (
                      <tr key={row.id} onClick={() => setDrawerRow(row)} className="cursor-pointer transition-colors"
                        style={{ background: String(row.id) === topId ? 'oklch(32% 0.08 130 / 0.04)' : 'var(--color-surface)' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg)')}
                        onMouseLeave={e => (e.currentTarget.style.background = String(row.id) === topId ? 'oklch(32% 0.08 130 / 0.04)' : 'var(--color-surface)')}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            {row.image && (
                              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--color-surface-warm)' }}>
                                <Image src={row.image} alt={row.title} fill sizes="32px" className="object-cover" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="font-medium truncate max-w-[15ch]" style={{ color: 'var(--color-text)' }}>{row.title}</span>
                                {String(row.id) === topId && <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'oklch(32% 0.08 130 / 0.1)', color: 'var(--color-primary)' }}>Top</span>}
                              </div>
                              <p className="text-[10px] truncate max-w-[18ch]" style={{ color: 'var(--color-muted)' }}>{row.location}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-3 py-3 text-center">
                          <Sparkline data={(row.stats.period_stats ?? []).map(d => d.views)} color="var(--color-primary)" />
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums font-medium" style={{ color: 'var(--color-text)' }}>{row.stats.total_views}</td>
                        <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--color-text)' }}>{row.stats.total_contacts}</td>
                        <td className="px-4 py-3 text-right tabular-nums hidden lg:table-cell" style={{ color: 'var(--color-text)' }}>{Math.min(100, row.stats.conversion_rate).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalTablePages > 1 && (
                <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
                  <span className="text-xs" style={{ color: 'var(--color-muted)' }}>Page {tablePage} / {totalTablePages}</span>
                  <div className="flex items-center gap-2">
                    <button disabled={tablePage === 1} onClick={() => setTablePage(p => p - 1)} className="px-3 py-1.5 text-xs font-medium rounded-lg disabled:opacity-40" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>← Précédent</button>
                    <button disabled={tablePage === totalTablePages} onClick={() => setTablePage(p => p + 1)} className="px-3 py-1.5 text-xs font-medium rounded-lg disabled:opacity-40" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}>Suivant →</button>
                  </div>
                </div>
              )}
            </div>

            {/* Donuts column */}
            <div className="flex flex-col gap-4">
              <Card>
                <SectionLabel text="Répartition" />
                <p className="font-semibold text-sm mb-5" style={{ color: 'var(--color-text)' }}>Types de biens</p>
                {donutSlices.length === 0 ? <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucune donnée.</p> : <DonutChart slices={donutSlices} size={104} />}
              </Card>
              <Card>
                <SectionLabel text="Répartition" />
                <p className="font-semibold text-sm mb-5" style={{ color: 'var(--color-text)' }}>Par localisation</p>
                {(() => {
                  const counts = rows.reduce<Record<string, number>>((acc, r) => { const loc = r.location || 'Autre'; acc[loc] = (acc[loc] ?? 0) + 1; return acc }, {})
                  const slices = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 7)
                    .map(([label, value], i) => ({ label, value, color: `oklch(${[42,52,58,65,48,60,55][i%7]}% ${[0.10,0.12,0.14,0.09,0.11,0.08,0.13][i%7]} ${LOCATION_HUES[i%7]})` }))
                  return slices.length > 0 ? <DonutChart slices={slices} size={104} centerLabel="biens" /> : <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucune donnée.</p>
                })()}
              </Card>
              <Card>
                <SectionLabel text="Répartition" />
                <p className="font-semibold text-sm mb-5" style={{ color: 'var(--color-text)' }}>Vente vs Location</p>
                {(() => {
                  const vc = rows.filter(r => r.mode === 'vente').length
                  const lc = rows.filter(r => r.mode === 'location').length
                  return vc + lc === 0 ? <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucune donnée.</p>
                    : <DonutChart slices={[{ label: 'Vente', value: vc, color: 'var(--color-primary)' }, { label: 'Location', value: lc, color: 'var(--color-accent)' }]} size={104} centerLabel="biens" />
                })()}
              </Card>
            </div>
          </div>
        )}
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 4 — Par logement (property deep-dive with its own selector)
      ═══════════════════════════════════════════════════════════════════════ */}
      {rows.length > 0 && (
        <section className="mb-10">
          {/* Section header + property selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <SectionLabel text="Analyse par logement" />
              <h2 className="font-display font-semibold text-base" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                Statistiques d&apos;un bien
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Sélectionnez un logement pour voir ses statistiques détaillées
              </p>
            </div>
            <select
              value={propFilterId}
              onChange={e => handlePropSelect(e.target.value)}
              className="text-sm font-medium px-3 py-2.5 rounded-xl appearance-none cursor-pointer shrink-0"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: propFilterId ? 'var(--color-text)' : 'var(--color-muted)', outlineColor: 'var(--color-primary)', minWidth: 220 }}>
              <option value="">— Choisir un logement —</option>
              {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
          </div>

          {/* Empty state */}
          {!propFilterId && (
            <Card>
              <p className="text-sm text-center py-6" style={{ color: 'var(--color-muted)' }}>
                Choisissez un logement dans le menu ci-dessus pour afficher ses statistiques.
              </p>
            </Card>
          )}

          {/* Deep-dive content */}
          {propFilterId && propRow && (() => {
            const s = slicedStats(propRow.stats, propDays === 7 ? 7 : 30)
            return (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                {/* Left: property card + KPIs */}
                <div className="flex flex-col gap-4">
                  {/* Property thumbnail + info */}
                  <Card>
                    <div className="flex items-start gap-3">
                      {propRow.image && (
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--color-surface-warm)' }}>
                          <Image src={propRow.image} alt={propRow.title} fill sizes="64px" className="object-cover" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-sm leading-tight" style={{ color: 'var(--color-text)' }}>{propRow.title}</p>
                        <p className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--color-muted)' }}>
                          <IconPin /> {propRow.location}
                        </p>
                        <p className="font-display font-bold text-sm tabular-nums mt-2" style={{ color: 'var(--color-primary)' }}>{fmt(propRow.price)} DT</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 grid grid-cols-2 gap-2" style={{ borderTop: '1px solid var(--color-border)' }}>
                      {[
                        { label: 'Type',        value: normalizeType(propRow.property_type) },
                        { label: 'Transaction',  value: propRow.mode === 'vente' ? 'Vente' : 'Location' },
                        { label: 'Statut',       value: propRow.status === 'published' ? 'Publié' : propRow.status === 'draft' ? 'Brouillon' : propRow.status === 'sold' ? 'Vendu' : 'Loué' },
                      ].map(({ label, value }) => (
                        <div key={label}>
                          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>{label}</p>
                          <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--color-text)' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* KPIs for this property */}
                  {propStatsLoad ? (
                    <div className="grid grid-cols-2 gap-3">
                      {[0,1,2,3].map(i => (
                        <div key={i} className="rounded-2xl p-4 animate-pulse" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', height: 80 }} />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <KpiCard label="Vues" value={fmt(propRow.stats.total_views)} icon={<IconEye />} />
                      <KpiCard label="Vues uniques" value={fmt(propRow.stats.unique_views)} icon={<IconUser />} />
                      <KpiCard label="Contacts" value={propRow.stats.total_contacts} icon={<IconMail />} color="var(--color-accent)" />
                      <KpiCard label="Conversion" value={`${Math.min(100, propRow.stats.conversion_rate).toFixed(1)}%`} icon={<IconTrend />} />
                    </div>
                  )}
                </div>

                {/* Center: daily views bar chart for this property */}
                <Card className="lg:col-span-2">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <SectionLabel text="Activité journalière" />
                      <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                        Vues par jour — {propDays}j
                      </p>
                    </div>
                    <div className="flex items-center gap-1 p-0.5 rounded-full" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                      {([7, 30] as const).map(d => (
                        <button key={d} onClick={() => handlePropDays(d)}
                          className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                          style={propDays === d ? { background: 'var(--color-primary)', color: '#fff' } : { color: 'var(--color-text-secondary)', background: 'transparent' }}>
                          {d}j
                        </button>
                      ))}
                    </div>
                  </div>
                  {propTrendLoad ? (
                    <div className="flex justify-center items-center" style={{ height: 160 }}>
                      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                    </div>
                  ) : propTrend.length === 0 ? (
                    <p className="text-xs py-10 text-center" style={{ color: 'var(--color-muted)' }}>Aucune donnée pour cette période.</p>
                  ) : (
                    /* Daily bar chart — one bar per day, height = views that day */
                    <div className="flex items-end gap-1" style={{ height: 160 }}>
                      {propTrend.map((d, i) => {
                        const maxV = Math.max(...propTrend.map(x => x.views), 1)
                        const pct  = d.views / maxV
                        const date = new Date(d.date)
                        const label = date.toLocaleDateString('fr-TN', { day: '2-digit', month: 'short' })
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-1 group relative" title={`${label} : ${d.views} vue${d.views !== 1 ? 's' : ''}`}>
                            {d.views > 0 && (
                              <span className="absolute bottom-full mb-1 text-[9px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity tabular-nums" style={{ color: 'var(--color-primary)' }}>
                                {d.views}
                              </span>
                            )}
                            <div className="w-full rounded-t-md transition-all"
                              style={{
                                height: `${Math.max(pct * 130, d.views > 0 ? 4 : 2)}px`,
                                background: d.views > 0 ? 'var(--color-primary)' : 'var(--color-border)',
                                opacity: d.views > 0 ? 0.85 : 0.4,
                              }} />
                            {propDays <= 14 && (
                              <span className="text-[8px] leading-none" style={{ color: 'var(--color-muted)' }}>
                                {date.getDate()}
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* Vs. portfolio average comparison */}
                  <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>Comparaison — ce bien vs. votre moyenne</p>
                    {(() => {
                      const avgViews    = rows.length > 0 ? rows.reduce((s, r) => s + r.stats.total_views,    0) / rows.length : 0
                      const avgUnique   = rows.length > 0 ? rows.reduce((s, r) => s + r.stats.unique_views,   0) / rows.length : 0
                      const avgContacts = rows.length > 0 ? rows.reduce((s, r) => s + r.stats.total_contacts, 0) / rows.length : 0

                      const metrics = [
                        { label: 'Vues totales',  prop: propRow.stats.total_views,    avg: avgViews,    icon: <IconEye /> },
                        { label: 'Vues uniques',  prop: propRow.stats.unique_views,   avg: avgUnique,   icon: <IconUser /> },
                        { label: 'Contacts',      prop: propRow.stats.total_contacts, avg: avgContacts, icon: <IconMail /> },
                      ]
                      return (
                        <div className="space-y-2.5">
                          {metrics.map(({ label, prop, avg, icon }) => {
                            const diff = avg > 0 ? ((prop - avg) / avg) * 100 : 0
                            const above = diff >= 0
                            return (
                              <div key={label} className="flex items-center gap-3">
                                <div className="shrink-0" style={{ color: 'var(--color-muted)' }}>{icon}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
                                    <span className="text-xs font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{fmt(Math.round(prop))}</span>
                                  </div>
                                  <div className="w-full rounded-full h-1.5 relative overflow-hidden" style={{ background: 'var(--color-bg)' }}>
                                    <div className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${Math.min(100, avg > 0 ? (prop / Math.max(prop, avg)) * 100 : 100)}%`,
                                        background: above ? 'var(--color-primary)' : 'oklch(58% 0.14 45)',
                                      }} />
                                  </div>
                                </div>
                                <span className="text-[10px] font-semibold shrink-0 tabular-nums w-14 text-right"
                                  style={{ color: above ? 'var(--color-primary)' : 'oklch(52% 0.14 25)' }}>
                                  {avg > 0 ? `${above ? '+' : ''}${Math.round(diff)}%` : '—'}
                                </span>
                              </div>
                            )
                          })}
                          <p className="text-[10px] mt-1" style={{ color: 'var(--color-muted)' }}>
                            Moyenne calculée sur {rows.length} bien{rows.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      )
                    })()}
                  </div>
                </Card>

              </div>
            )
          })()}
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 5 — Par ville (location deep-dive with its own selector)
      ═══════════════════════════════════════════════════════════════════════ */}
      {locations.length > 0 && (
        <section className="mb-10">
          {/* Section header + city selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <SectionLabel text="Analyse par ville" />
              <h2 className="font-display font-semibold text-base" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                Statistiques d&apos;une ville
              </h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
                Sélectionnez une ville pour voir ses biens et performances
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              <select
                value={locFilter}
                onChange={e => setLocFilter(e.target.value)}
                className="text-sm font-medium px-3 py-2.5 rounded-xl appearance-none cursor-pointer"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: locFilter ? 'var(--color-text)' : 'var(--color-muted)', outlineColor: 'var(--color-primary)', minWidth: 180 }}>
                <option value="">— Choisir une ville —</option>
                {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
              </select>
              {locFilter && <TimeToggle value={locTime} onChange={setLocTime} />}
            </div>
          </div>

          {/* Empty state */}
          {!locFilter && (
            <Card>
              <p className="text-sm text-center py-6" style={{ color: 'var(--color-muted)' }}>
                Choisissez une ville dans le menu ci-dessus pour afficher ses statistiques.
              </p>
            </Card>
          )}

          {/* City content */}
          {locFilter && locRows.length > 0 && (() => {
            const locAgg = locRows.reduce((acc, r) => {
              const s = slicedStats(r.stats, locTime)
              return { views: acc.views + s.views, unique: acc.unique + s.unique, contacts: acc.contacts + s.contacts }
            }, { views: 0, unique: 0, contacts: 0 })

            const locTypeData = locRows.reduce<Record<string, number>>((acc, r) => {
              const t = normalizeType(r.property_type)
              const s = slicedStats(r.stats, locTime)
              acc[t] = (acc[t] ?? 0) + (locMetric === 'views' ? s.views : s.contacts)
              return acc
            }, {})
            const locTypeSlices = Object.entries(locTypeData).filter(([, v]) => v > 0)
              .map(([label, value]) => ({ label, value, color: TYPE_COLORS[label] ?? 'var(--color-muted)' }))

            const locRanked = [...locRows]
              .map(r => { const s = slicedStats(r.stats, locTime); return { label: r.title.slice(0, 28), value: locMetric === 'views' ? s.views : s.contacts } })
              .sort((a, b) => b.value - a.value).slice(0, 6)

            return (
              <div className="space-y-4">
                {/* KPI strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <KpiCard label="Biens dans la ville" value={locRows.length}       icon={<IconHome />} />
                  <KpiCard label="Vues totales"         value={fmt(locAgg.views)}   icon={<IconEye />} />
                  <KpiCard label="Vues uniques"         value={fmt(locAgg.unique)}  icon={<IconUser />} />
                  <KpiCard label="Contacts"             value={locAgg.contacts}     icon={<IconMail />} color="var(--color-accent)" />
                </div>

                {/* Charts row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Metric toggle + donut by type */}
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <SectionLabel text="Par type" />
                        <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                          {locMetric === 'views' ? 'Vues par type' : 'Leads par type'}
                        </p>
                      </div>
                      <div className="flex items-center rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)', background: 'var(--color-bg)' }}>
                        {(['views', 'leads'] as const).map(m => (
                          <button key={m} onClick={() => setLocMetric(m)}
                            className="px-2.5 py-1 text-xs font-semibold transition-colors"
                            style={{ background: locMetric === m ? 'var(--color-primary)' : 'transparent', color: locMetric === m ? '#fff' : 'var(--color-text-secondary)' }}>
                            {m === 'views' ? 'Vues' : 'Leads'}
                          </button>
                        ))}
                      </div>
                    </div>
                    {locTypeSlices.length > 0
                      ? <DonutChart slices={locTypeSlices} size={100} centerLabel={locMetric === 'views' ? 'vues' : 'leads'} />
                      : <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucune donnée.</p>}
                  </Card>

                  {/* Bar: top properties in this city */}
                  <Card className="sm:col-span-2">
                    <SectionLabel text="Classement" />
                    <p className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>
                      {locMetric === 'views' ? 'Top biens par vues' : 'Top biens par leads'} — {locFilter}
                    </p>
                    {locRanked.some(r => r.value > 0)
                      ? <BarChart items={locRanked} showPercent defaultColor="var(--color-primary)" />
                      : <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucune donnée enregistrée pour cette période.</p>}
                  </Card>
                </div>

                {/* Property list for this city */}
                <Card>
                  <SectionLabel text="Biens" />
                  <p className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>Tous les biens à {locFilter}</p>
                  <div className="space-y-2">
                    {locRows.map(r => {
                      const s = slicedStats(r.stats, locTime)
                      return (
                        <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--color-bg)' }}>
                          {r.image && (
                            <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0" style={{ background: 'var(--color-surface-warm)' }}>
                              <Image src={r.image} alt={r.title} fill sizes="40px" className="object-cover" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>{r.title}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{normalizeType(r.property_type)} · {r.mode === 'vente' ? 'Vente' : 'Location'} · {fmt(r.price)} DT</p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0 text-right">
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Vues</p>
                              <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-text)' }}>{fmt(s.views)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Contacts</p>
                              <p className="text-sm font-bold tabular-nums" style={{ color: 'var(--color-accent)' }}>{s.contacts}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            )
          })()}

          {locFilter && locRows.length === 0 && (
            <Card><p className="text-sm text-center py-6" style={{ color: 'var(--color-muted)' }}>Aucun bien trouvé pour {locFilter}.</p></Card>
          )}
        </section>
      )}

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 6 — Visibilité & Trafic
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <SectionHeader label="Visibilité" title="Trafic & origines" />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--color-text)' }}>{trendTitle}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-muted)' }}>Vues sur les {trendDays} derniers jours</p>
              </div>
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                {properties.length > 0 && (
                  <select value={trendPropId} onChange={e => handleTrendProp(e.target.value)}
                    className="text-xs font-medium px-3 py-2 rounded-xl appearance-none cursor-pointer"
                    style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', outlineColor: 'var(--color-primary)' }}>
                    <option value="all">Toutes les annonces</option>
                    {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                )}
                <div className="flex items-center gap-1 p-0.5 rounded-full" style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                  {([7, 30] as const).map(d => (
                    <button key={d} onClick={() => handleTrendDays(d)}
                      className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
                      style={trendDays === d ? { background: 'var(--color-primary)', color: '#fff' } : { color: 'var(--color-text-secondary)', background: 'transparent' }}>
                      {d}j
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {trendLoading ? (
              <div className="flex justify-center items-center" style={{ height: 160 }}>
                <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
              </div>
            ) : (
              <LineChart data={trend} height={160} />
            )}
          </Card>

          <Card>
            <SectionLabel text="Origines" />
            <p className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>Visiteurs par pays</p>
            {countryItems.length === 0
              ? <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Données disponibles après le prochain cycle de tracking.</p>
              : <BarChart items={countryItems} showPercent defaultColor="var(--color-primary)" />}
            {citiesTnItems.length > 0 && (
              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>Gouvernorats (Tunisie)</p>
                <BarChart items={citiesTnItems} showPercent defaultColor="oklch(42% 0.12 155)" />
              </div>
            )}
            <div className="mt-5 pt-4 flex items-center gap-3" style={{ borderTop: '1px solid var(--color-border)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--color-surface-warm)', color: 'var(--color-primary)' }}><IconClock /></div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>Durée moy. visite</p>
                <p className="font-display font-bold tabular-nums text-lg leading-none mt-0.5" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>{fmtDuration(summary?.avg_duration_seconds ?? null)}</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════
          SECTION 7 — Conversion (with time range filter)
      ═══════════════════════════════════════════════════════════════════════ */}
      <section className="mb-10">
        <SectionHeader
          label="Conversion"
          title="Leads & entonnoir"
          right={<TimeToggle value={convTime} onChange={setConvTime} />}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <SectionLabel text="Entonnoir de conversion" />
            <p className="font-semibold text-sm mb-5" style={{ color: 'var(--color-text)' }}>Vues → Contacts</p>
            <FunnelChart steps={[
              { label: 'Vues totales',  value: convAgg.views },
              { label: 'Vues uniques',  value: convAgg.unique },
              { label: 'Contacts',      value: convAgg.contacts },
            ]} />
          </Card>

          <Card>
            <SectionLabel text="Contacts" />
            <p className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>Répartition des contacts</p>
            {rows.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>Aucun bien publié.</p>
            ) : (
              <>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-display font-bold tabular-nums" style={{ fontSize: 'clamp(1.75rem, 3vw, 2.25rem)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                    {convAgg.contacts}
                  </span>
                  <span className="text-sm" style={{ color: 'var(--color-muted)' }}>contact{convAgg.contacts !== 1 ? 's' : ''} total</span>
                </div>
                <BarChart
                  items={rows.filter(r => r.stats.total_contacts > 0).sort((a, b) => b.stats.total_contacts - a.stats.total_contacts).slice(0, 5)
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

      {/* ── Stats drawer ───────────────────────────────────────────────────── */}
      {drawerRow && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setDrawerRow(null)}>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.3)' }} />
          <div className="relative w-full max-w-sm h-full shadow-2xl overflow-y-auto flex flex-col"
            style={{ background: 'var(--color-surface)' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between px-5 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-3 min-w-0">
                {drawerRow.image && (
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0" style={{ background: 'var(--color-surface-warm)' }}>
                    <Image src={drawerRow.image} alt={drawerRow.title} fill sizes="40px" className="object-cover" />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-display font-semibold text-sm leading-tight truncate" style={{ color: 'var(--color-text)' }}>{drawerRow.title}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>{drawerRow.location}</p>
                </div>
              </div>
              <button onClick={() => setDrawerRow(null)} className="ml-3 shrink-0 p-1.5 rounded-lg" style={{ color: 'var(--color-muted)', background: 'var(--color-bg)' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
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
            <div className="px-5 pb-6 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--color-muted)' }}>Vues — 30 derniers jours</p>
              <LineChart data={drawerRow.stats.period_stats ?? []} height={140} />
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
