interface StatsCardProps {
  label: string
  value: number | string
  sub?: string
  color?: string
}

export function StatsCard({ label, value, sub, color = 'var(--color-primary)' }: StatsCardProps) {
  return (
    <div className="rounded-2xl p-3 sm:p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2 sm:mb-3 leading-tight" style={{ color: 'var(--color-muted)' }}>
        {label}
      </p>
      <p className="font-display font-bold tabular-nums text-2xl sm:text-[2rem]" style={{ color, lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>{sub}</p>}
    </div>
  )
}
