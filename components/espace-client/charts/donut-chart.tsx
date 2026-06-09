interface DonutSlice {
  label: string
  value: number
  color: string
}

interface DonutChartProps {
  slices: DonutSlice[]
  size?: number
  centerLabel?: string
}

const CIRCUMFERENCE = 2 * Math.PI * 40

export function DonutChart({ slices, size = 104, centerLabel = 'biens' }: DonutChartProps) {
  const total = slices.reduce((s, sl) => s + sl.value, 0)
  if (total === 0) {
    return (
      <div className="flex items-center justify-center rounded-full"
        style={{ width: size, height: size, background: 'var(--color-border)' }}>
        <span className="text-xs" style={{ color: 'var(--color-muted)' }}>—</span>
      </div>
    )
  }

  let accumulated = 0
  const segments = slices.map((sl) => {
    const len = (sl.value / total) * CIRCUMFERENCE
    const offset = -accumulated
    accumulated += len
    return { ...sl, len, offset }
  })

  return (
    <div>
      {/* Donut SVG */}
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox="0 0 104 104" aria-hidden="true">
          {/* Background track */}
          <circle cx={52} cy={52} r={40} fill="none"
            stroke="var(--color-border)" strokeWidth={18} />
          {/* Segments */}
          {segments.map((seg) => (
            <circle
              key={seg.label}
              cx={52} cy={52} r={40}
              fill="none"
              stroke={seg.color}
              strokeWidth={18}
              strokeDasharray={`${seg.len} ${CIRCUMFERENCE}`}
              strokeDashoffset={seg.offset}
              transform="rotate(-90 52 52)"
              strokeLinecap="butt"
            />
          ))}
        </svg>
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-display font-bold tabular-nums text-lg leading-none" style={{ color: 'var(--color-text)' }}>
            {total}
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: 'var(--color-muted)' }}>
            {centerLabel}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2">
        {slices.filter((sl) => sl.value > 0).map((sl) => (
          <div key={sl.label} className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: sl.color }} />
              <span className="text-xs truncate" style={{ color: 'var(--color-text-secondary)' }}>{sl.label}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>{sl.value}</span>
              <span className="text-[10px]" style={{ color: 'var(--color-muted)' }}>
                {Math.round((sl.value / total) * 100)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
