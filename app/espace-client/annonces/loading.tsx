export default function AnnoncesLoading() {
  return (
    <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-6xl w-full">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="space-y-2">
          <div className="h-8 w-36 rounded-xl animate-pulse" style={{ background: 'var(--color-border)' }} />
          <div className="h-4 w-16 rounded-lg animate-pulse" style={{ background: 'var(--color-border)' }} />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-52 rounded-xl animate-pulse" style={{ background: 'var(--color-border)' }} />
          <div className="h-10 w-24 rounded-full animate-pulse" style={{ background: 'var(--color-border)' }} />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="h-44 animate-pulse" style={{ background: 'var(--color-border)' }} />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
              <div className="h-3 w-1/2 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
              <div className="h-5 w-1/3 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <div className="flex-1 h-9 rounded-xl animate-pulse" style={{ background: 'var(--color-border)' }} />
              <div className="flex-1 h-9 rounded-xl animate-pulse" style={{ background: 'var(--color-border)' }} />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
