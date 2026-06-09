interface SparklineProps {
  data: number[]
  color?: string
  width?: number
  height?: number
}

export function Sparkline({ data, color = 'var(--color-primary)', width = 64, height = 24 }: SparklineProps) {
  if (!data || data.length < 2) {
    return (
      <svg width={width} height={height} aria-hidden="true">
        <line x1={0} y1={height / 2} x2={width} y2={height / 2}
          stroke="var(--color-border)" strokeWidth={1.5} strokeDasharray="3 2" />
      </svg>
    )
  }

  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const pad = 2

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - pad * 2) + pad
    const y = height - pad - ((v - min) / range) * (height - pad * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} aria-hidden="true">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
