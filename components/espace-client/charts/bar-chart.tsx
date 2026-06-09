interface BarItem {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  items: BarItem[]
  showPercent?: boolean
  defaultColor?: string
  maxValue?: number
}

export function BarChart({ items, showPercent = true, defaultColor = 'var(--color-primary)', maxValue }: BarChartProps) {
  if (!items.length) return null
  const max = maxValue ?? Math.max(...items.map((i) => i.value))

  return (
    <div className="space-y-2.5">
      {items.map((item) => {
        const pct = max > 0 ? (item.value / max) * 100 : 0
        const displayPct = max > 0 ? Math.round((item.value / items.reduce((s, i) => s + i.value, 0)) * 100) : 0
        return (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-xs font-medium shrink-0 w-24 truncate" style={{ color: 'var(--color-text-secondary)' }}>
              {item.label}
            </span>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, background: item.color ?? defaultColor }}
              />
            </div>
            {showPercent && (
              <span className="text-xs tabular-nums font-semibold w-8 text-right shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
                {displayPct}%
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
