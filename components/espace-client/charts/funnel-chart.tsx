interface FunnelStep {
  label: string
  value: number
  color?: string
}

interface FunnelChartProps {
  steps: FunnelStep[]
}

function ChevronDown() {
  return (
    <svg className="w-3.5 h-3.5 mx-auto my-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

const STEP_WIDTHS = ['100%', '74%', '50%']
const STEP_COLORS = [
  'oklch(32% 0.08 130 / 0.12)',
  'oklch(32% 0.08 130 / 0.2)',
  'oklch(58% 0.14 45 / 0.18)',
]
const STEP_TEXT_COLORS = [
  'var(--color-primary)',
  'var(--color-primary)',
  'var(--color-accent)',
]

function fmt(n: number) { return n.toLocaleString('fr-TN') }

export function FunnelChart({ steps }: FunnelChartProps) {
  return (
    <div className="flex flex-col items-center gap-0">
      {steps.map((step, i) => {
        const nextStep = steps[i + 1]
        const convPct = nextStep && step.value > 0
          ? Math.min(100, Math.round((nextStep.value / step.value) * 100))
          : null

        return (
          <div key={step.label} className="w-full">
            <div
              className="mx-auto flex items-center justify-between px-4 sm:px-5 transition-all duration-300"
              style={{
                width: STEP_WIDTHS[i] ?? '50%',
                height: '56px',
                background: step.color ?? STEP_COLORS[i] ?? STEP_COLORS[2],
                borderRadius: '3px',
              }}
            >
              <span className="text-xs font-semibold" style={{ color: STEP_TEXT_COLORS[i] ?? 'var(--color-primary)' }}>
                {step.label}
              </span>
              <span className="text-sm font-bold tabular-nums font-display" style={{ color: STEP_TEXT_COLORS[i] ?? 'var(--color-primary)' }}>
                {fmt(step.value)}
              </span>
            </div>

            {nextStep && (
              <div className="flex flex-col items-center py-0.5">
                <ChevronDown />
                {convPct !== null && (
                  <span className="text-[10px] font-semibold tabular-nums" style={{ color: 'var(--color-muted)' }}>
                    {convPct}% →
                  </span>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
