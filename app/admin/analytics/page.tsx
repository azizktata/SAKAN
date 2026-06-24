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
  location_name: string | null
  search_count: number
  zero_result_count: number
  zero_result_pct: number
}

type ZeroResultLocation = {
  id: number | null
  name: string | null
  zero_result_searches: number
  total_searches: number
  failure_rate: number
}

type TopType = {
  property_type: string | null
  search_count: number
}

type TopCity = {
  id: number
  name: string
  search_count: number
  zero_result_count: number
  zero_result_pct: number
}

type SearchTrends = {
  top_filters: TopFilter[]
  zero_results_by_location: ZeroResultLocation[]
  top_types: TopType[]
  top_cities: TopCity[]
  total_searches: number
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
      className="rounded-2xl p-5"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      <p
        className="text-[10px] font-semibold uppercase tracking-widest mb-2"
        style={{ color: 'var(--color-muted)' }}
      >
        {label}
      </p>
      <p
        className="font-display font-bold text-2xl tabular-nums"
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
      className="font-display font-semibold text-base mb-4"
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
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-muted)' }}>
          Administration
        </p>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--color-text)' }}>
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
        <div className="flex justify-center py-16">
          <div
            className="w-8 h-8 rounded-full border-2 animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
          />
        </div>
      ) : (
        <div className="space-y-10">
          {/* 3. Market Insights table */}
          <section>
            <SectionTitle>Insights par ville</SectionTitle>
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'var(--color-bg)' }}>
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
                  className="divide-y" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
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
          <section>
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
                      <tr style={{ background: 'var(--color-bg)' }}>
                        <TableHeader>Pays</TableHeader>
                        <TableHeaderRight>Vues</TableHeaderRight>
                        <TableHeaderRight>Visiteurs uniques</TableHeaderRight>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y"
                      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
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
                      <tr style={{ background: 'var(--color-bg)' }}>
                        <TableHeader>Ville</TableHeader>
                        <TableHeader>Pays</TableHeader>
                        <TableHeaderRight>Vues</TableHeaderRight>
                      </tr>
                    </thead>
                    <tbody
                      className="divide-y"
                      style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
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
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-base" style={{ color: 'var(--color-text)' }}>
                Tendances de recherche
              </h2>
              {searchTrends && (
                <span className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: 'oklch(32% 0.08 130 / 0.08)', color: 'var(--color-primary)' }}>
                  {searchTrends.total_searches.toLocaleString('fr-TN')} recherches — 30j
                </span>
              )}
            </div>

            <div className="space-y-6">
              {/* Row 1: Top filter combos + Top cities */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Top filter combinations */}
                <div>
                  <SubSectionTitle>Top combinaisons de filtres</SubSectionTitle>
                  <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: 'var(--color-bg)' }}>
                          <TableHeader>Transaction</TableHeader>
                          <TableHeader>Type</TableHeader>
                          <TableHeader>Ville</TableHeader>
                          <TableHeaderRight>Nb</TableHeaderRight>
                          <TableHeaderRight>% Échec</TableHeaderRight>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        {!searchTrends || searchTrends.top_filters.length === 0 ? (
                          <EmptyRow colSpan={5} message="Aucune donnée de recherche" />
                        ) : (
                          searchTrends.top_filters.map((row, i) => (
                            <tr key={i} className="hover:bg-[var(--color-bg)] transition-colors">
                              <TableCell>
                                {TX_LABELS[row.transaction_type ?? ''] ?? row.transaction_type ?? <span style={{ color: 'var(--color-muted)' }}>Tous</span>}
                              </TableCell>
                              <TableCell>
                                {PROP_LABELS[row.property_type ?? ''] ?? row.property_type ?? <span style={{ color: 'var(--color-muted)' }}>Tous</span>}
                              </TableCell>
                              <TableCell>
                                {row.location_name
                                  ? <span>{row.location_name}</span>
                                  : <span style={{ color: 'var(--color-muted)' }}>Toutes</span>}
                              </TableCell>
                              <TableCellRight>{row.search_count.toLocaleString('fr-TN')}</TableCellRight>
                              <TableCellRight>
                                <span style={{
                                  color: row.zero_result_pct >= 50
                                    ? 'oklch(45% 0.18 25)'
                                    : row.zero_result_pct > 0
                                    ? 'var(--color-accent)'
                                    : 'var(--color-text-secondary)',
                                  fontWeight: row.zero_result_pct >= 50 ? 600 : 400,
                                }}>
                                  {row.zero_result_pct > 0 ? `${row.zero_result_pct}%` : '—'}
                                </span>
                              </TableCellRight>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top cities by search volume */}
                <div>
                  <SubSectionTitle>Villes les plus recherchées</SubSectionTitle>
                  <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: 'var(--color-bg)' }}>
                          <TableHeader>Ville</TableHeader>
                          <TableHeaderRight>Recherches</TableHeaderRight>
                          <TableHeaderRight>% Échec</TableHeaderRight>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        {!searchTrends || searchTrends.top_cities.length === 0 ? (
                          <EmptyRow colSpan={3} message="Aucune recherche géolocalisée" />
                        ) : (
                          searchTrends.top_cities.map((row) => (
                            <tr key={row.id} className="hover:bg-[var(--color-bg)] transition-colors">
                              <TableCell><span className="font-medium">{row.name}</span></TableCell>
                              <TableCellRight>{row.search_count.toLocaleString('fr-TN')}</TableCellRight>
                              <TableCellRight>
                                <span style={{
                                  color: row.zero_result_pct >= 50
                                    ? 'oklch(45% 0.18 25)'
                                    : row.zero_result_pct > 0
                                    ? 'var(--color-accent)'
                                    : 'var(--color-text-secondary)',
                                  fontWeight: row.zero_result_pct >= 50 ? 600 : 400,
                                }}>
                                  {row.zero_result_pct > 0 ? `${row.zero_result_pct}%` : '—'}
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

              {/* Row 2: Zero-result cities + Top types */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Villes sans résultats — named cities only, with failure rate */}
                <div>
                  <SubSectionTitle>Villes sans résultats — demande non satisfaite</SubSectionTitle>
                  <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: 'var(--color-bg)' }}>
                          <TableHeader>Ville</TableHeader>
                          <TableHeaderRight>Échecs</TableHeaderRight>
                          <TableHeaderRight>/ Total</TableHeaderRight>
                          <TableHeaderRight>Taux</TableHeaderRight>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        {!searchTrends || searchTrends.zero_results_by_location.length === 0 ? (
                          <EmptyRow colSpan={4} message="Aucune demande non satisfaite" />
                        ) : (
                          searchTrends.zero_results_by_location.map((row, i) => (
                            <tr key={row.id ?? i} className="hover:bg-[var(--color-bg)] transition-colors">
                              <TableCell><span className="font-medium">{row.name}</span></TableCell>
                              <TableCellRight>
                                <span style={{ color: 'var(--color-accent)' }}>
                                  {row.zero_result_searches.toLocaleString('fr-TN')}
                                </span>
                              </TableCellRight>
                              <TableCellRight>
                                <span style={{ color: 'var(--color-text-secondary)' }}>
                                  {row.total_searches.toLocaleString('fr-TN')}
                                </span>
                              </TableCellRight>
                              <TableCellRight>
                                <span style={{
                                  color: row.failure_rate >= 80
                                    ? 'oklch(45% 0.18 25)'
                                    : row.failure_rate >= 50
                                    ? 'var(--color-accent)'
                                    : 'var(--color-text-secondary)',
                                  fontWeight: row.failure_rate >= 50 ? 600 : 400,
                                }}>
                                  {row.failure_rate}%
                                </span>
                              </TableCellRight>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top property types */}
                <div>
                  <SubSectionTitle>Types de biens les plus recherchés</SubSectionTitle>
                  <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ background: 'var(--color-bg)' }}>
                          <TableHeader>Type de bien</TableHeader>
                          <TableHeaderRight>Recherches</TableHeaderRight>
                          <TableHeaderRight>% du total</TableHeaderRight>
                        </tr>
                      </thead>
                      <tbody className="divide-y" style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                        {!searchTrends || searchTrends.top_types.length === 0 ? (
                          <EmptyRow colSpan={3} message="Aucune recherche par type" />
                        ) : (
                          searchTrends.top_types.map((row, i) => {
                            const pct = searchTrends.total_searches > 0
                              ? Math.round(row.search_count / searchTrends.total_searches * 100)
                              : 0
                            return (
                              <tr key={i} className="hover:bg-[var(--color-bg)] transition-colors">
                                <TableCell>
                                  <span className="font-medium">
                                    {PROP_LABELS[row.property_type ?? ''] ?? row.property_type ?? '—'}
                                  </span>
                                </TableCell>
                                <TableCellRight>{row.search_count.toLocaleString('fr-TN')}</TableCellRight>
                                <TableCellRight>
                                  <span style={{ color: 'var(--color-text-secondary)' }}>{pct}%</span>
                                </TableCellRight>
                              </tr>
                            )
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
