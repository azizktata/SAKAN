'use client'

import { useEffect, useState } from 'react'
import { analyticsApi, type PropertyStats, type DailyTrend } from '@/lib/api'

interface Props {
  propertyId: string
  title:      string
  onClose:    () => void
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl p-4 text-center" style={{ background: 'var(--color-bg)' }}>
      <p className="font-display font-bold text-2xl tabular-nums" style={{ color: 'var(--color-text)' }}>{value}</p>
      <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>{label}</p>
    </div>
  )
}

function MiniBar({ days }: { days: DailyTrend[] }) {
  if (days.length === 0) return null
  const max = Math.max(...days.map(d => d.views), 1)
  return (
    <div className="flex items-end gap-0.5 h-10">
      {days.map((d) => (
        <div
          key={d.date}
          className="flex-1 rounded-sm min-h-[2px]"
          style={{
            height:     `${Math.round((d.views / max) * 100)}%`,
            background: 'var(--color-primary)',
            opacity:    d.views === 0 ? 0.2 : 1,
          }}
          title={`${d.date}: ${d.views} vue${d.views !== 1 ? 's' : ''}`}
        />
      ))}
    </div>
  )
}

export function StatsDrawer({ propertyId, title, onClose }: Props) {
  const [stats, setStats]   = useState<PropertyStats | null>(null)
  const [trend, setTrend]   = useState<DailyTrend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      analyticsApi.propertyStats(propertyId),
      analyticsApi.propertyTrend(propertyId, 7),
    ]).then(([s, t]) => {
      setStats(s.data)
      setTrend(t.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [propertyId])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4"
        style={{ background: 'var(--color-surface)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-semibold text-base" style={{ color: 'var(--color-text)' }}>
              Statistiques
            </h2>
            <p className="text-xs mt-0.5 truncate max-w-[26ch]" style={{ color: 'var(--color-muted)' }}>{title}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ color: 'var(--color-muted)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-7 h-7 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : stats ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <StatCard label="Vues totales"   value={stats.total_views} />
              <StatCard label="Vues uniques"   value={stats.unique_views} />
              <StatCard label="Contacts"       value={stats.total_contacts} />
              <StatCard label="Taux conversion" value={`${stats.conversion_rate.toFixed(1)}%`} />
            </div>

            {trend.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
                  Vues — 7 derniers jours
                </p>
                <MiniBar days={trend} />
                <div className="flex justify-between mt-1">
                  <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{trend[0]?.date?.slice(5)}</span>
                  <span className="text-xs" style={{ color: 'var(--color-muted)' }}>{trend[trend.length - 1]?.date?.slice(5)}</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-sm py-6" style={{ color: 'var(--color-muted)' }}>
            Aucune donnée disponible pour ce bien.
          </p>
        )}
      </div>
    </div>
  )
}
