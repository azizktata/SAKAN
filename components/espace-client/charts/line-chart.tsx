import type { DailyTrend } from '@/lib/api'

interface LineChartProps {
  data: DailyTrend[]
  showUnique?: boolean
  height?: number
}

function fmt(date: string) {
  return new Date(date).toLocaleDateString('fr-TN', { day: 'numeric', month: 'short' })
}

export function LineChart({ data, showUnique = true, height = 160 }: LineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-xl"
        style={{ height, background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Aucune donnée disponible</p>
      </div>
    )
  }

  const W = 600
  const H = height
  const padL = 8
  const padR = 8
  const padT = 12
  const padB = 4

  const chartW = W - padL - padR
  const chartH = H - padT - padB

  const views  = data.map((d) => d.views)
  const unique = data.map((d) => d.unique_views)
  const allVals = showUnique ? [...views, ...unique] : views
  const maxVal = Math.max(...allVals, 1)

  function xOf(i: number) { return padL + (i / (data.length - 1)) * chartW }
  function yOf(v: number) { return padT + chartH - (v / maxVal) * chartH * 0.9 }

  const viewsPoints  = data.map((d, i) => `${xOf(i)},${yOf(d.views)}`).join(' ')
  const uniquePoints = data.map((d, i) => `${xOf(i)},${yOf(d.unique_views)}`).join(' ')

  const viewsArea   = `${padL},${padT + chartH} ${viewsPoints} ${xOf(data.length - 1)},${padT + chartH}`
  const uniqueArea  = `${padL},${padT + chartH} ${uniquePoints} ${xOf(data.length - 1)},${padT + chartH}`

  // 3 horizontal guide lines
  const guides = [0.25, 0.5, 0.75].map((r) => padT + chartH - r * chartH * 0.9)

  // Date labels: first, ~middle, last
  const labelIdxs = data.length <= 4
    ? data.map((_, i) => i)
    : [0, Math.floor((data.length - 1) / 2), data.length - 1]

  return (
    <div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height }}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Guide lines */}
        {guides.map((y, i) => (
          <line key={i} x1={padL} y1={y} x2={W - padR} y2={y}
            stroke="var(--color-border)" strokeWidth={1} strokeDasharray="4 3" />
        ))}

        {/* Area fills */}
        {showUnique && (
          <polygon points={uniqueArea} fill="var(--color-accent)" opacity={0.06} />
        )}
        <polygon points={viewsArea} fill="var(--color-primary)" opacity={0.09} />

        {/* Lines */}
        {showUnique && (
          <polyline points={uniquePoints} fill="none"
            stroke="var(--color-accent)" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
        )}
        <polyline points={viewsPoints} fill="none"
          stroke="var(--color-primary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots on last point */}
        <circle cx={xOf(data.length - 1)} cy={yOf(data[data.length - 1].views)} r={3}
          fill="var(--color-primary)" />
        {showUnique && (
          <circle cx={xOf(data.length - 1)} cy={yOf(data[data.length - 1].unique_views)} r={2.5}
            fill="var(--color-accent)" />
        )}
      </svg>

      {/* Date labels */}
      <div className="flex justify-between mt-1 px-1">
        {labelIdxs.map((idx) => (
          <span key={idx} className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
            {fmt(data[idx].date)}
          </span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full" style={{ background: 'var(--color-primary)' }} />
          <span className="text-[10px] font-medium" style={{ color: 'var(--color-muted)' }}>Vues</span>
        </div>
        {showUnique && (
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full" style={{ background: 'var(--color-accent)' }} />
            <span className="text-[10px] font-medium" style={{ color: 'var(--color-muted)' }}>Vues uniques</span>
          </div>
        )}
      </div>
    </div>
  )
}
