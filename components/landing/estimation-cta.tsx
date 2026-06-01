import Link from 'next/link'

export function EstimationCta() {
  return (
    <section className="py-20 md:py-28" style={{ background: 'var(--color-surface-warm)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-0 overflow-hidden"
          style={{ border: '1px solid var(--color-border-strong)' }}>

          <div className="flex flex-col justify-center px-8 md:px-12 py-12 md:py-16">
            <h2 className="font-display font-bold leading-tight mb-5"
              style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
              Combien vaut<br />votre bien&nbsp;?
            </h2>
            <p className="leading-relaxed mb-8"
              style={{ fontSize: '0.9375rem', color: 'var(--color-text-secondary)', maxWidth: '40ch', fontFamily: 'var(--font-sans)' }}>
              Estimation instantanée basée sur les données réelles du marché tunisien 2024–2025.
              Vente ou location — en moins d&rsquo;une minute.
            </p>
            <Link
              href="?estimer=open"
              className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 self-start"
              style={{ background: 'var(--color-primary)', borderRadius: '3px', fontFamily: 'var(--font-sans)' }}
            >
              Estimer mon bien
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="flex flex-col justify-center" style={{ background: 'var(--color-primary)', padding: '3rem' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-6"
              style={{ color: 'oklch(65% 0.012 70)', fontFamily: 'var(--font-sans)' }}>
              Prix médians · marché tunisien 2025
            </p>
            <table className="w-full" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid oklch(45% 0.06 130)' }}>
                  {['Ville', 'Type', 'DT/m²'].map((h, i) => (
                    <th key={h}
                      className={`pb-3 text-xs font-semibold uppercase tracking-wider ${i === 2 ? 'text-right' : 'text-left'}`}
                      style={{ color: 'oklch(65% 0.012 70)', fontFamily: 'var(--font-sans)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { city: 'Tunis',    type: 'Appartement', price: '3 200' },
                  { city: 'La Marsa', type: 'Villa',        price: '6 500' },
                  { city: 'Sousse',   type: 'Appartement', price: '2 600' },
                  { city: 'Sfax',     type: 'Maison',       price: '1 800' },
                ].map((row, i) => (
                  <tr key={row.city}
                    style={{ borderBottom: i < 3 ? '1px solid oklch(40% 0.05 130)' : undefined }}>
                    <td className="py-3.5 font-semibold"
                      style={{ color: 'oklch(92% 0.01 70)', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>
                      {row.city}
                    </td>
                    <td className="py-3.5"
                      style={{ color: 'oklch(65% 0.012 70)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem' }}>
                      {row.type}
                    </td>
                    <td className="py-3.5 text-right font-display font-bold tabular-nums"
                      style={{ color: 'var(--color-accent-light)', fontSize: '1.0625rem', letterSpacing: '-0.01em' }}>
                      {row.price}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
