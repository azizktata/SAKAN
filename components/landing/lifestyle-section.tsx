import Image from 'next/image'
import Link from 'next/link'

function IconArrow() {
  return (
    <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}

export function LifestyleSection() {
  return (
    <section className="py-20 md:py-28" style={{ background: 'var(--color-bg)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <h2 className="font-display font-bold leading-tight"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', color: 'var(--color-text)', letterSpacing: '-0.02em' }}>
            Vous cherchez quoi, exactement&nbsp;?
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
          {/* Featured tall card */}
          <Link href="/logements?type=Villa&mode=vente"
            className="group relative overflow-hidden col-span-1 row-span-2 flex flex-col justify-end"
            style={{ minHeight: '420px', background: 'var(--color-primary)' }}>
            <Image src="/prop-9.jpg" alt="Villa avec jardin" fill
              sizes="33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04] opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
            <div className="relative z-10 p-6 md:p-8">
              <p className="text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: 'var(--color-accent-light)', fontFamily: 'var(--font-sans)' }}>
                Avec jardin
              </p>
              <p className="font-display font-bold text-white leading-tight"
                style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', letterSpacing: '-0.02em' }}>
                Villas & maisons<br />avec espace extérieur
              </p>
              <span className="mt-4 flex items-center gap-1.5 text-sm font-semibold transition-opacity group-hover:opacity-70"
                style={{ color: 'var(--color-accent-light)', fontFamily: 'var(--font-sans)' }}>
                Voir les biens <IconArrow />
              </span>
            </div>
          </Link>

          {/* Proche écoles */}
          <Link href="/logements?type=Maison&mode=vente"
            className="group relative overflow-hidden flex flex-col justify-end"
            style={{ minHeight: '200px', background: 'oklch(28% 0.07 130)' }}>
            <Image src="/prop-5.jpg" alt="Résidence familiale" fill
              sizes="33vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04] opacity-50" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="relative z-10 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: 'var(--color-accent-light)', fontFamily: 'var(--font-sans)' }}>
                Pour les familles
              </p>
              <p className="font-display font-bold text-white"
                style={{ fontSize: '1.125rem', letterSpacing: '-0.01em' }}>
                Proche écoles & mosquées
              </p>
            </div>
          </Link>

          {/* Neuf — typographic */}
          <Link href="/logements?mode=vente&type=Appartement"
            className="group relative overflow-hidden flex flex-col justify-end"
            style={{ minHeight: '200px', background: 'var(--color-surface-deep)' }}>
            <div className="absolute top-4 left-4 font-display font-bold select-none pointer-events-none"
              style={{ fontSize: 'clamp(4rem, 7vw, 6rem)', color: 'var(--color-border-strong)', lineHeight: 1, letterSpacing: '-0.04em' }}>
              Neuf
            </div>
            <div className="relative z-10 p-5">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: 'var(--color-accent)', fontFamily: 'var(--font-sans)' }}>
                Biens neufs & récents
              </p>
              <p className="font-display font-bold"
                style={{ fontSize: '1.125rem', color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                Prêts à emménager
              </p>
              <span className="mt-3 flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-sans)' }}>
                Explorer <IconArrow />
              </span>
            </div>
          </Link>

          {/* Location wide card */}
          <Link href="/logements?mode=location"
            className="group relative overflow-hidden flex flex-col justify-end md:col-span-2"
            style={{ minHeight: '200px', background: 'var(--color-primary)' }}>
            <Image src="/prop-8.jpg" alt="Appartement à louer" fill
              sizes="66vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04] opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
            <div className="relative z-10 p-5 md:p-7 flex items-end justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-1"
                  style={{ color: 'var(--color-accent-light)', fontFamily: 'var(--font-sans)' }}>
                  Location
                </p>
                <p className="font-display font-bold text-white"
                  style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', letterSpacing: '-0.01em' }}>
                  Louer sans s&rsquo;engager à long terme
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-sm font-semibold shrink-0 ml-6 transition-opacity group-hover:opacity-70"
                style={{ color: 'var(--color-accent-light)', fontFamily: 'var(--font-sans)' }}>
                Voir <IconArrow />
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
