const PRINCIPLES = [
  {
    n: '01', tag: 'Transparence',
    title: 'Le prix affiché est le prix réel.',
    body: 'Toutes les informations disponibles, sans ambiguïté ni frais cachés.',
  },
  {
    n: '02', tag: 'Éthique & Halal',
    title: 'Transactions directes, conformes à vos valeurs.',
    body: 'Sans crédit caché, sans pratiques douteuses. Pour votre tranquillité d\'esprit.',
  },
  {
    n: '03', tag: 'Simplicité',
    title: 'Trouver ou publier un bien en quelques clics.',
    body: 'Pas de compte obligatoire pour consulter. Conçu pour aller à l\'essentiel.',
  },
  {
    n: '04', tag: 'Direct',
    title: 'Vous et le propriétaire. C\'est tout.',
    body: 'Pas d\'intermédiaire, pas de commission. Le contact est immédiat et gratuit.',
  },
] as const

export function PrinciplesSection() {
  return (
    <section className="py-20 md:py-32" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16 max-w-2xl">
          <h2 className="font-display font-bold leading-tight"
            style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Nos valeurs,{' '}
            <span style={{ color: 'var(--color-accent)' }}>vos garanties.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          style={{ borderTop: '2px solid var(--color-accent)' }}>
          {PRINCIPLES.map((p, i) => (
            <div key={p.n}
              className="py-10"
              style={{
                paddingLeft: i === 0 ? '0' : '2rem',
                paddingRight: i === 3 ? '0' : '2rem',
                borderRight: i < 3 ? '1px solid var(--color-border)' : undefined,
              }}>
              <span className="font-display font-bold block mb-4 select-none"
                style={{ fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', color: 'var(--color-accent)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                {p.n}
              </span>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3"
                style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-sans)' }}>
                {p.tag}
              </p>
              <h3 className="font-display font-bold mb-3 leading-snug"
                style={{ fontSize: '1.0625rem', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                {p.title}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', maxWidth: '28ch', lineHeight: 1.65, fontFamily: 'var(--font-sans)' }}>
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
