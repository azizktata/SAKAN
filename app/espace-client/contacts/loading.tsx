export default function ContactsLoading() {
  return (
    <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-4xl w-full">
      <div className="mb-6 space-y-1">
        <div className="h-8 w-28 rounded-xl animate-pulse" style={{ background: 'var(--color-border)' }} />
        <div className="h-4 w-20 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
      </div>
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-2xl p-4 flex gap-4" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <div className="w-12 h-12 rounded-xl animate-pulse shrink-0" style={{ background: 'var(--color-border)' }} />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
              <div className="h-3 w-2/3 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
              <div className="h-3 w-1/2 rounded animate-pulse" style={{ background: 'var(--color-border)' }} />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
