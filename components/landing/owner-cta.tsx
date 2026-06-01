import Image from 'next/image'
import Link from 'next/link'

export function OwnerCta() {
  return (
    <section className="overflow-hidden" style={{ background: 'var(--color-primary)' }}>
      <div className="max-w-7xl mx-auto grid md:grid-cols-2" style={{ minHeight: '480px' }}>
        <div className="flex flex-col justify-center px-8 md:px-12 py-16 md:py-20">
          <h2 className="font-display font-bold text-white leading-tight mb-6"
            style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', letterSpacing: '-0.02em' }}>
            Vous avez un bien<br />à vendre ou à louer&nbsp;?
          </h2>
          <p className="leading-relaxed mb-8"
            style={{ fontSize: '0.9375rem', color: 'oklch(72% 0.012 70)', maxWidth: '42ch', fontFamily: 'var(--font-sans)' }}>
            Publiez gratuitement. Simple, rapide, sans commission.
            Devant des milliers d&rsquo;acheteurs et locataires actifs.
          </p>
          <ul className="mb-10 space-y-2">
            {[
              '0 DT de commission',
              'Annonce publiée en 5 minutes',
              "Contact direct avec l'acheteur",
              'Tableau de bord personnel',
            ].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="w-1 h-1 rounded-full shrink-0" style={{ background: 'var(--color-accent)' }} />
                <span style={{ fontSize: '0.9375rem', color: 'oklch(80% 0.012 70)', fontFamily: 'var(--font-sans)' }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="?publish=open"
              className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-accent)', color: 'white', borderRadius: '3px', fontFamily: 'var(--font-sans)' }}>
              Publier gratuitement
            </Link>
            <Link href="/espace-client"
              className="inline-flex items-center justify-center px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-white/10"
              style={{ border: '1px solid oklch(55% 0.06 130)', color: 'oklch(82% 0.012 70)', borderRadius: '3px', fontFamily: 'var(--font-sans)' }}>
              Mon espace
            </Link>
          </div>
        </div>
        <div className="relative hidden md:block">
          <Image src="/prop-3.jpg" alt="Belle résidence tunisienne" fill
            sizes="50vw" className="object-cover opacity-60" />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to right, var(--color-primary) 0%, transparent 35%)' }} />
        </div>
      </div>
    </section>
  )
}
