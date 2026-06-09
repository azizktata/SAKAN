'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useCallback } from 'react'
import { KpiCard }   from '@/components/espace-client/kpi-card'
import { LineChart } from '@/components/espace-client/charts/line-chart'
import { Sparkline } from '@/components/espace-client/charts/sparkline'
import { useAuth }   from '@/lib/auth-context'
import {
  propertiesApi, analyticsApi,
  type Property, type Contact, type OwnerSummary, type PropertyStats, type DailyTrend,
} from '@/lib/api'

// ─── Status meta ──────────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: 'Publié',    color: 'var(--color-primary)',        bg: 'oklch(32% 0.08 130 / 0.1)' },
  draft:     { label: 'Brouillon', color: 'var(--color-text-secondary)', bg: 'oklch(60% 0.014 70 / 0.1)' },
  sold:      { label: 'Vendu',     color: 'var(--color-accent)',         bg: 'oklch(58% 0.14 45 / 0.12)' },
  rented:    { label: 'Loué',      color: 'var(--color-accent)',         bg: 'oklch(58% 0.14 45 / 0.12)' },
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

function IconHome()  { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> }
function IconEye()   { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> }
function IconMail()  { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> }
function IconUser()  { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> }
function IconTrend() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg> }
function IconClock() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> }
function IconDraft() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> }

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: 'var(--color-muted)' }}>{text}</p>
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function EspaceClientPage() {
  const { user, logout } = useAuth()
  const [properties,   setProperties]   = useState<Property[]>([])
  const [contacts,     setContacts]     = useState<Contact[]>([])
  const [summary,      setSummary]      = useState<OwnerSummary | null>(null)
  const [statsMap,     setStatsMap]     = useState<Record<string, PropertyStats>>({})
  const [trend,        setTrend]        = useState<DailyTrend[]>([])
  const [trendLoading, setTrendLoading] = useState(false)
  const [loading,      setLoading]      = useState(true)

  const fetchTrend = useCallback((id: string) => {
    setTrendLoading(true)
    analyticsApi.propertyTrend(id, 7)
      .then(r => setTrend(r.data))
      .catch(() => setTrend([]))
      .finally(() => setTrendLoading(false))
  }, [])

  useEffect(() => {
    Promise.all([
      propertiesApi.myList(),
      propertiesApi.myContacts(),
      analyticsApi.ownerSummary(),
    ]).then(async ([propsRes, contactsRes, sumRes]) => {
      const props = propsRes.data.data
      const sum   = sumRes.data
      setProperties(props)
      setContacts(contactsRes.data.data)
      setSummary(sum)

      // Fetch per-property stats for sparklines
      props.forEach(p => {
        analyticsApi.propertyStats(p.id).then(r => {
          setStatsMap(prev => ({ ...prev, [p.id]: r.data }))
        }).catch(() => {})
      })

      // Fetch trend for top property
      const topId = sum.top_property?.id ?? props[0]?.id
      if (topId) fetchTrend(topId)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [fetchTrend])

  const published  = properties.filter(p => p.status === 'published').length
  const drafts     = properties.filter(p => p.status === 'draft').length
  const firstName  = user?.name?.split(' ')[0] ?? 'vous'
  const topId      = summary?.top_property?.id

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl w-full">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="mb-8 flex items-start sm:items-center justify-between gap-3">
        <div>
          <SectionLabel text="Espace client" />
          <h1 className="font-display font-bold leading-tight"
            style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.875rem)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Bonjour, {firstName}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Voici un aperçu de votre activité.
          </p>
        </div>
        <Link
          href="?publish=open"
          className="shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}>
          + Publier un bien
        </Link>
      </div>

      {/* ── KPI row: 4 cols on sm+, 2 on mobile ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        <KpiCard label="Annonces publiées" value={loading ? '—' : published}                               icon={<IconHome />} />
        <KpiCard label="Brouillons"        value={loading ? '—' : drafts}   color="var(--color-text-secondary)" icon={<IconDraft />} />
        <KpiCard label="Vues totales"      value={loading ? '—' : fmt(summary?.total_views ?? 0)}          icon={<IconEye />} />
        <KpiCard label="Vues uniques"      value={loading ? '—' : fmt(summary?.total_unique_views ?? 0)}   icon={<IconUser />} />
        <KpiCard label="Contacts reçus"    value={loading ? '—' : (summary?.total_contacts ?? contacts.length)} color="var(--color-accent)" icon={<IconMail />} />
        <KpiCard
          label="Taux de conversion"
          value={loading ? '—' : `${Math.min(100, summary?.avg_conversion_rate ?? 0).toFixed(1)}%`}
          sub="contacts / vues uniques"
          icon={<IconTrend />}
        />
      </div>

      {/* ── Two-col row: trend chart + quick stats ───────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">

          {/* Trend chart */}
          <div className="lg:col-span-2 rounded-2xl p-4 sm:p-5"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <SectionLabel text="Tendance" />
                <p className="font-display font-semibold text-sm"
                  style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                  {summary?.top_property?.title
                    ? `Vues — ${summary.top_property.title}`
                    : 'Vues sur 7 jours'}
                </p>
              </div>
              <Link href="/espace-client/analytics"
                className="shrink-0 text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-primary)' }}>
                Voir tout →
              </Link>
            </div>
            {trendLoading ? (
              <div className="flex justify-center items-center" style={{ height: 140 }}>
                <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                  style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
              </div>
            ) : (
              <LineChart data={trend} height={140} />
            )}
          </div>

          {/* Quick stats column */}
          <div className="flex flex-col gap-3">
            {/* Avg duration */}
            <div className="rounded-2xl p-4 sm:p-5 flex items-center gap-3"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'var(--color-surface-warm)', color: 'var(--color-primary)' }}>
                <IconClock />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
                  Durée moy. visite
                </p>
                <p className="font-display font-bold text-xl tabular-nums leading-none mt-1"
                  style={{ color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
                  {fmtDuration(summary?.avg_duration_seconds ?? null)}
                </p>
              </div>
            </div>

            {/* Top property */}
            {summary?.top_property && (
              <div className="rounded-2xl p-4 sm:p-5"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>
                  Meilleure annonce
                </p>
                <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--color-text)' }}>
                  {summary.top_property.title}
                </p>
                <p className="text-xs mt-1.5 tabular-nums" style={{ color: 'var(--color-primary)' }}>
                  {fmt(summary.top_property.views)} vues
                </p>
              </div>
            )}

            {/* Countries */}
            {summary && summary.top_countries.length > 0 && (
              <div className="rounded-2xl p-4 sm:p-5 flex-1"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
                  Visiteurs par pays
                </p>
                <div className="space-y-2">
                  {summary.top_countries.slice(0, 3).map(({ country, views }) => {
                    const maxV = summary.top_countries[0]?.views ?? 1
                    return (
                      <div key={country} className="flex items-center gap-2">
                        <span className="text-xs w-16 truncate shrink-0" style={{ color: 'var(--color-text-secondary)' }}>{country}</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
                          <div className="h-full rounded-full" style={{ width: `${(views / maxV) * 100}%`, background: 'var(--color-primary)' }} />
                        </div>
                        <span className="text-xs tabular-nums shrink-0 w-6 text-right" style={{ color: 'var(--color-muted)' }}>{views}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ── Recent properties ──────────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <SectionLabel text="Récent" />
                <h2 className="font-display font-semibold text-base" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                  Mes annonces
                </h2>
              </div>
              <Link href="/espace-client/annonces"
                className="text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-primary)' }}>
                Voir tout →
              </Link>
            </div>

            {properties.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Aucune annonce pour l&apos;instant.</p>
                <Link href="?publish=open"
                  className="inline-flex mt-3 px-4 py-2 rounded-full text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ background: 'var(--color-primary)' }}>
                  Publier un bien
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {properties.slice(0, 4).map((prop) => {
                  const s     = STATUS_META[prop.status] ?? STATUS_META.draft
                  const cover = prop.images?.find(i => i.is_cover) ?? prop.images?.[0]
                  const stats = statsMap[prop.id]
                  return (
                    <div key={prop.id}
                      className="flex items-center gap-3 p-3 rounded-2xl"
                      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                      {/* Thumbnail */}
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0"
                        style={{ background: 'var(--color-surface-warm)' }}>
                        {cover && <Image src={cover.url} alt={prop.title} fill sizes="56px" className="object-cover" />}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--color-text)' }}>{prop.title}</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>
                          {prop.location?.name ?? prop.address ?? '—'}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="font-display font-bold text-sm tabular-nums leading-none" style={{ color: 'var(--color-text)' }}>
                            {fmt(prop.price)} DT
                          </p>
                          {stats && (
                            <span className="text-xs tabular-nums" style={{ color: 'var(--color-muted)' }}>
                              {stats.total_views} vue{stats.total_views !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      {/* Sparkline + status */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {stats?.period_stats && stats.period_stats.length > 1 && (
                          <Sparkline
                            data={stats.period_stats.map(d => d.views)}
                            color={prop.id === topId ? 'var(--color-primary)' : 'var(--color-muted)'}
                          />
                        )}
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                          style={{ color: s.color, background: s.bg }}>
                          {s.label}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* ── Recent contacts ────────────────────────────────────────────── */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <SectionLabel text="Demandes" />
                <h2 className="font-display font-semibold text-base" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                  Derniers contacts
                </h2>
              </div>
              <Link href="/espace-client/contacts"
                className="text-xs font-semibold transition-opacity hover:opacity-70"
                style={{ color: 'var(--color-primary)' }}>
                Voir tout →
              </Link>
            </div>

            {contacts.length === 0 ? (
              <div className="rounded-2xl p-8 text-center" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Aucune demande pour l&apos;instant.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {contacts.slice(0, 4).map((c) => (
                  <div key={c.id} className="flex items-start gap-3 p-4 rounded-2xl"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-sm"
                      style={{ background: 'oklch(58% 0.14 45 / 0.12)', color: 'var(--color-accent)' }}>
                      {c.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{c.name}</p>
                        <p className="text-xs shrink-0" style={{ color: 'var(--color-muted)' }}>
                          {new Date(c.created_at).toLocaleDateString('fr-TN', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                      {c.property && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-primary)' }}>
                          Re : {c.property.title}
                        </p>
                      )}
                      <p className="text-xs mt-1 leading-relaxed line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                        {c.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      )}

      {/* Mobile-only quick actions */}
      <div className="flex sm:hidden flex-col gap-2 mt-6">
        <Link href="/"
          className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Retour à l&apos;accueil</span>
          <span style={{ color: 'var(--color-muted)' }}>→</span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center justify-center px-4 py-3.5 rounded-2xl text-sm font-medium"
          style={{ background: 'oklch(52% 0.15 25 / 0.06)', color: 'oklch(45% 0.15 25)' }}>
          Déconnexion
        </button>
      </div>
    </main>
  )
}
