'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  adminAnalyticsApi,
  type MarketInsight,
  type SessionStats,
  type GeoBreakdown,
} from '@/lib/api'

// ── Local types for search-trends response ────────────────────────────────────

type TopFilter = {
  transaction_type: string | null
  property_type: string | null
  location_id: number | null
  search_count: number
  zero_result_count: number
}

type ZeroResultLocation = {
  id: number | null
  name: string | null
  zero_result_searches: number
}

type SearchTrends = {
  top_filters: TopFilter[]
  zero_results_by_location: ZeroResultLocation[]
  period_days: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}min ${s}s`
}

const TX_LABELS: Record<string, string> = {
  sale: 'Vente',
  rent: 'Location',
}

const PROP_LABELS: Record<string, string> = {
  apartment: 'Appartement',
  villa: 'Villa',
  house: 'Maison',
  land: 'Terrain',
  commercial: 'Commercial',
  office: 'Bureau',
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div
      className="rounded-2xl p-4"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wider mb-1"
        style={{ color: 'var(--color-muted)' }}
      >
        {label}
      </p>
      <p
        className="font-display font-bold text-xl tabular-nums"
        style={{ color: 'var(--color-text)' }}
      >
        {value}
      </p>
    </div>
  )
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
      style={{ color: 'var(--color-muted)' }}
    >
      {children}
    </th>
  )
}

function TableHeaderRight({ children }: { children: React.ReactNode }) {
  return (
    <th
      className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide"
      style={{ color: 'var(--color-muted)' }}
    >
      {children}
    </th>
  )
}

function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-4 py-3" style={{ color: 'var(--color-text)' }}>
      {children}
    </td>
  )
}

function TableCellRight({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-4 py-3 text-right tabular-nums" style={{ color: 'var(--color-text)' }}>
      {children}
    </td>
  )
}

function EmptyRow({ colSpan, message }: { colSpan: number; message: string }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-10 text-center text-sm italic"
        style={{ color: 'var(--color-muted)' }}
      >
        {message}
      </td>
    </tr>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-display font-semibold mb-4"
      style={{ color: 'var(--color-text)' }}
    >
      {children}
    </h2>
  )
}

function SubSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-sm font-semibold mb-3"
      style={{ color: 'var(--color-text)' }}
    >
      {children}
    </h3>
  )
}

// ── Mini bar (CSS-only, 0–100 range) ─────────────────────────────────────────

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className="flex items-center gap-2">
      <span className="tabular-nums text-sm w-10" style={{ color: 'var(--color-text)' }}>
        {value.toFixed(1)}
      </span>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: 'var(--color-border)' }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: 'var(--color-primary)' }}
        />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminAnalyticsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()

  const [marketInsights, setMarketInsights] = useState<MarketInsight[]>([])
  const [sessionStats, setSessionStats]     = useState<SessionStats | null>(null)
  const [geoBreakdown, setGeoBreakdown]     = useState<GeoBreakdown | null>(null)
  const [searchTrends, setSearchTrends]     = useState<SearchTrends | null>(null)
  const [loading, setLoading]               = useState(true)

  // Admin guard — layout handles it too, but belt-and-suspenders
  useEffect(() => {
    if (!authLoading && user && user.role !== 'admin') {
      router.replace('/espace-client')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (authLoading) return
    if (!user || user.role !== 'admin') return

    Promise.all([
      adminAnalyticsApi.marketInsights()
        .then((r) => setMarketInsights(r.data ?? []))
        .catch(() => {}),
      adminAnalyticsApi.sessionStats()
        .then((r) => setSessionStats(r.data))
        .catch(() => {}),
      adminAnalyticsApi.geoBreakdown()
        .then((r) => setGeoBreakdown(r.data))
        .catch(() => {}),
      adminAnalyticsApi.searchTrends()
        .then((r) => setSearchTrends(r.data as SearchTrends))
        .catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [user, authLoading])

  if (authLoading || (!user && !authLoading)) {
    return (
      <main className="flex-1 flex items-center justify-center py-20">
        <div
          className="w-8 h-8 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
        />
      </main>
    )
  }

  return (
    <main className="flex-1 px-6 py-8 max-w-5xl w-full">
      {/* 1. Page header */}
      <div className="mb-8">
        <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--color-text)' }}>
          Analytics Marché
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Données des 30 derniers jours
        </p>
      </div>

      {/* 2. Session KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <KpiCard
          label="Total sessions"
          value={sessionStats ? sessionStats.total_sessions.toLocaleString('fr-TN') : '—'}
        />
        <KpiCard
          label="Durée moyenne"
          value={sessionStats ? fmtDuration(sessionStats.avg_duration_seconds) : '—'}
        />
        <KpiCard
          label="Pages / session"
          value={sessionStats ? sessionStats.avg_pages_per_session.toFixed(1) : '—'}
        />
        <KpiCard
          label="Taux de rebond"
          value={sessionStats ? `${sessionStats.bounce_rate.toFixed(1)}%` : '—'}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
          />
        </div>
      ) : (
        <>
          {/* 3. Market Insights table */}
          <section className="mb-8">
            <SectionTitle>Insights par ville</SectionTitle>
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'oklch(96% 0.005 155)' }}>
                    <TableHeader>Ville</TableHeader>
                    <TableHeaderRight>Demande</TableHeaderRight>
                    <TableHeaderRight>Attractivité</TableHeaderRight>
                    <TableHeaderRight>Liquidité</TableHeaderRight>
                    <TableHeaderRight>Gap</TableHeaderRight>
                    <TableHeaderRight>Recherches</TableHeaderRight>
                    <TableHeaderRight>Biens publiés</TableHeaderRight>
                  </tr>
                </thead>
                <tbody
                  className="divide-y"
                  style={{ background: 'var(--color-surface)' }}
                >
                  {marketInsights.length === 0 ? (
                    <EmptyRow
                      colSpan={7}
                      message="Aucune donnée — relancez analytics:aggregate-market"
                    />
                  ) : (
                    marketInsights.slice(0, 10).map((row) => (
                      <tr key={row.id}>
                        <TableCell>
                          <span className="font-medium">{row.name}</span>
                        </TableCell>
                        <td className="px-4 py-3 min-w-[120px]">
                          <ScoreBar value={row.demand_index} />
                        </td>
                        <td className="px-4 py-3 min-w-[120px]">
                          <ScoreBar value={row.attractiveness_score} />
                        </td>
                        <td className="px-4 py-3 min-w-[120px]">
                          <ScoreBar value={row.liquidity_index} />
                        </td>
                        <td className="px-4 py-3 min-w-[120px]">
                          <ScoreBar value={row.search_gap_index} />
                        </td>
                        <TableCellRight>{row.searches_count.toLocaleString('fr-TN')}</TableCellRight>
                        <TableCellRight>{row.properties_published.toLocaleString('fr-TN')}</TableCellRight>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* 4. Geo Breakdown — two sub-tables side by side */}
          <section className="mb-8">
            <SectionTitle>Répartition géographique</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* By country */}
              <div>
                <SubSectionTitle>Par pays</SubSectionTitle>
                <div
                  className="rounded-2xl border overflow-hidden"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'oklch(96% 0.005 155)' }}>
                        <TableHeader>Pays</TableHeader>
                        <TableHeaderRight>Vues</TableHeaderRight>
                        <TableHeaderRight>Visiteurs uniques</TableHeaderRight>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y"
                      style={{ background: 'var(--color-surface)' }}
                    >
                      {!geoBreakdown || geoBreakdown.by_country.length === 0 ? (
                        <EmptyRow
                          colSpan={3}
                          message="Aucune donnée geo — .mmdb manquant ou aucune vue"
                        />
                      ) : (
                        geoBreakdown.by_country.slice(0, 10).map((row) => (
                          <tr key={row.country}>
                            <TableCell>{row.country || '—'}</TableCell>
                            <TableCellRight>{row.views_total.toLocaleString('fr-TN')}</TableCellRight>
                            <TableCellRight>{row.unique_visitors.toLocaleString('fr-TN')}</TableCellRight>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* By city */}
              <div>
                <SubSectionTitle>Par ville</SubSectionTitle>
                <div
                  className="rounded-2xl border overflow-hidden"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'oklch(96% 0.005 155)' }}>
                        <TableHeader>Ville</TableHeader>
                        <TableHeader>Pays</TableHeader>
                        <TableHeaderRight>Vues</TableHeaderRight>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y"
                      style={{ background: 'var(--color-surface)' }}
                    >
                      {!geoBreakdown || geoBreakdown.by_city.length === 0 ? (
                        <EmptyRow
                          colSpan={3}
                          message="Aucune donnée geo — .mmdb manquant ou aucune vue"
                        />
                      ) : (
                        geoBreakdown.by_city.slice(0, 10).map((row, i) => (
                          <tr key={`${row.city_geo}-${i}`}>
                            <TableCell>{row.city_geo || '—'}</TableCell>
                            <TableCell>
                              <span style={{ color: 'var(--color-text-secondary)' }}>
                                {row.country || '—'}
                              </span>
                            </TableCell>
                            <TableCellRight>{row.views_total.toLocaleString('fr-TN')}</TableCellRight>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>

          {/* 5. Search Trends */}
          <section className="mb-8">
            <SectionTitle>Tendances de recherche</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Top searches */}
              <div>
                <SubSectionTitle>Top recherches</SubSectionTitle>
                <div
                  className="rounded-2xl border overflow-hidden"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'oklch(96% 0.005 155)' }}>
                        <TableHeader>Transaction</TableHeader>
                        <TableHeader>Type bien</TableHeader>
                        <TableHeaderRight>Recherches</TableHeaderRight>
                        <TableHeaderRight>Sans résultat</TableHeaderRight>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y"
                      style={{ background: 'var(--color-surface)' }}
                    >
                      {!searchTrends || searchTrends.top_filters.length === 0 ? (
                        <EmptyRow colSpan={4} message="Aucune donnée de recherche" />
                      ) : (
                        searchTrends.top_filters.map((row, i) => (
                          <tr key={i}>
                            <TableCell>
                              {TX_LABELS[row.transaction_type ?? ''] ?? row.transaction_type ?? '—'}
                            </TableCell>
                            <TableCell>
                              {PROP_LABELS[row.property_type ?? ''] ?? row.property_type ?? '—'}
                            </TableCell>
                            <TableCellRight>{row.search_count.toLocaleString('fr-TN')}</TableCellRight>
                            <TableCellRight>
                              <span
                                style={{
                                  color: row.zero_result_count > 0
                                    ? 'var(--color-accent)'
                                    : 'var(--color-text)',
                                }}
                              >
                                {row.zero_result_count.toLocaleString('fr-TN')}
                              </span>
                            </TableCellRight>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Villes sans résultats */}
              <div>
                <SubSectionTitle>Villes sans résultats</SubSectionTitle>
                <div
                  className="rounded-2xl border overflow-hidden"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ background: 'oklch(96% 0.005 155)' }}>
                        <TableHeader>Ville</TableHeader>
                        <TableHeaderRight>Recherches sans résultat</TableHeaderRight>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y"
                      style={{ background: 'var(--color-surface)' }}
                    >
                      {!searchTrends || searchTrends.zero_results_by_location.length === 0 ? (
                        <EmptyRow colSpan={2} message="Aucune ville avec demande non satisfaite" />
                      ) : (
                        searchTrends.zero_results_by_location.map((row, i) => (
                          <tr key={row.id ?? i}>
                            <TableCell>{row.name ?? '—'}</TableCell>
                            <TableCellRight>
                              <span style={{ color: 'var(--color-accent)' }}>
                                {row.zero_result_searches.toLocaleString('fr-TN')}
                              </span>
                            </TableCellRight>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  )
}
