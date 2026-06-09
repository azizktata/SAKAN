interface PeriodToggleProps {
  value: 7 | 30
  onChange: (v: 7 | 30) => void
}

export function PeriodToggle({ value, onChange }: PeriodToggleProps) {
  return (
    <div className="flex items-center gap-1 p-0.5 rounded-full"
      style={{ background: 'var(--color-surface-warm)', border: '1px solid var(--color-border)' }}>
      {([7, 30] as const).map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onChange(d)}
          className="px-3 py-1 rounded-full text-xs font-semibold transition-all duration-150"
          style={value === d
            ? { background: 'var(--color-primary)', color: '#fff' }
            : { color: 'var(--color-text-secondary)', background: 'transparent' }
          }
        >
          {d}j
        </button>
      ))}
    </div>
  )
}
