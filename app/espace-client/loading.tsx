export default function EspaceClientLoading() {
  return (
    <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl w-full">
      {/* Page title skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded-xl animate-pulse" style={{ background: 'var(--color-border)' }} />
          <div className="h-4 w-24 rounded-lg animate-pulse" style={{ background: 'var(--color-border)' }} />
        </div>
        <div className="h-10 w-28 rounded-full animate-pulse" style={{ background: 'var(--color-border)' }} />
      </div>

      {/* Stats row skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-2xl p-4 space-y-2" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="h-3 w-16 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
            <div className="h-7 w-20 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
          </div>
        ))}
      </div>

      {/* Card grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="h-44 animate-pulse" style={{ background: 'var(--color-border)' }} />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
              <div className="h-3 w-1/2 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
              <div className="h-5 w-1/3 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
