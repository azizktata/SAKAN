interface StatsCardProps {
  label: string
  value: number | string
  sub?: string
  color?: string
}

export function StatsCard({ label, value, sub, color = 'var(--color-primary)' }: StatsCardProps) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
        {label}
      </p>
      <p className="font-display font-bold tabular-nums" style={{ fontSize: '2rem', color, lineHeight: 1 }}>
        {value}
      </p>
      {sub && <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>{sub}</p>}
    </div>
  )
}
