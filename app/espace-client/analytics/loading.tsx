export default function AnalyticsLoading() {
  return (
    <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl w-full">
      <div className="mb-6 space-y-1">
        <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
        <div className="h-8 w-40 rounded-xl animate-pulse" style={{ background: 'var(--color-border)' }} />
        <div className="h-4 w-32 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
      </div>
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="rounded-2xl p-4 space-y-2" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="h-3 w-20 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
            <div className="h-7 w-14 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
          </div>
        ))}
      </div>
      {/* Chart placeholder */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', height: '260px' }}>
        <div className="h-4 w-32 rounded animate-pulse mb-4" style={{ background: 'var(--color-border)' }} />
        <div className="h-full animate-pulse rounded-xl" style={{ background: 'var(--color-border)', maxHeight: '180px' }} />
      </div>
      {/* Table rows */}
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="w-12 h-12 rounded-xl animate-pulse shrink-0" style={{ background: 'var(--color-border)' }} />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-2/3 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
              <div className="h-3 w-1/4 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
            </div>
            <div className="h-4 w-8 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
            <div className="h-4 w-8 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
          </div>
        ))}
      </div>
    </main>
  )
}
