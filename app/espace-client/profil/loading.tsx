export default function ProfilLoading() {
  return (
    <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-2xl w-full">
      <div className="mb-8 space-y-1">
        <div className="h-8 w-32 rounded-xl animate-pulse" style={{ background: 'var(--color-border)' }} />
      </div>
      <div className="rounded-2xl p-6 space-y-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full animate-pulse" style={{ background: 'var(--color-border)' }} />
          <div className="space-y-2">
            <div className="h-5 w-36 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
            <div className="h-3 w-24 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
          </div>
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3 w-20 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
            <div className="h-10 w-full rounded-xl animate-pulse" style={{ background: 'var(--color-border)' }} />
          </div>
        ))}
        <div className="h-10 w-32 rounded-full animate-pulse" style={{ background: 'var(--color-border)' }} />
      </div>
    </main>
  )
}
