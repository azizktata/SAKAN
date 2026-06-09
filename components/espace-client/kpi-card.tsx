interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: React.ReactNode
  color?: string
}

export function KpiCard({ label, value, sub, icon, color }: KpiCardProps) {
  return (
    <div className="rounded-2xl p-4 sm:p-5 flex flex-col gap-3"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
      {icon && (
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'var(--color-surface-warm)', color: color ?? 'var(--color-primary)' }}>
          {icon}
        </div>
      )}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--color-muted)' }}>
          {label}
        </p>
        <p className="font-display font-bold tabular-nums leading-none"
          style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.875rem)', color: color ?? 'var(--color-text)', letterSpacing: '-0.02em' }}>
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>{sub}</p>
        )}
      </div>
    </div>
  )
}
