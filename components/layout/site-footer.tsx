import Link from 'next/link'

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-4"
        style={{ color: 'var(--color-accent-light)', fontFamily: 'var(--font-sans)' }}>
        {title}
      </p>
      <ul className="space-y-2.5 text-sm"
        style={{ color: 'oklch(48% 0.01 70)', fontFamily: 'var(--font-sans)' }}>
        {children}
      </ul>
    </div>
  )
}

export function SiteFooter() {
  return (
    <footer className="pt-16 pb-8" style={{ background: 'oklch(11% 0.015 70)' }}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12 pb-12"
          style={{ borderBottom: '1px solid oklch(22% 0.012 70)' }}>
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5">
              <span className="font-display font-bold text-xl tracking-tight" style={{ color: 'oklch(94% 0.01 70)' }}>
                SAKAN
              </span>
              <span className="font-display" style={{ color: 'var(--color-accent-light)', fontSize: '1.1rem' }}>
                · سكن
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-4"
              style={{ color: 'oklch(52% 0.01 70)', maxWidth: '26ch', fontFamily: 'var(--font-sans)' }}>
              Immobilier éthique et transparent pour la Tunisie.
            </p>
            <p className="text-xs" style={{ color: 'oklch(42% 0.01 70)', fontFamily: 'var(--font-sans)' }}>
              Halal · Direct · Sans frais
            </p>
          </div>

          <FooterCol title="Vente">
            {[
              { label: 'Appartements', href: '/logements?mode=vente&type=Appartement' },
              { label: 'Villas',       href: '/logements?mode=vente&type=Villa'       },
              { label: 'Maisons',      href: '/logements?mode=vente&type=Maison'      },
              { label: 'Terrains',     href: '/logements?mode=vente&type=Terrain'     },
            ].map((t) => (
              <li key={t.label}><Link href={t.href} className="transition-colors hover:text-white">{t.label}</Link></li>
            ))}
          </FooterCol>

          <FooterCol title="Location">
            {[
              { label: 'Appartements', href: '/logements?mode=location&type=Appartement'      },
              { label: 'Bureaux',      href: '/logements?mode=location&type=Bureaux'          },
              { label: 'Villas',       href: '/logements?mode=location&type=Villa'            },
              { label: 'Locaux',       href: '/logements?mode=location&type=Local+commercial' },
            ].map((t) => (
              <li key={t.label}><Link href={t.href} className="transition-colors hover:text-white">{t.label}</Link></li>
            ))}
          </FooterCol>

          <FooterCol title="Informations">
            {[
              { label: 'Publier un bien', href: '?publish=open'            },
              { label: 'Mon espace',      href: '/espace-client'           },
              { label: 'CGU',             href: '/cgu'                     },
              { label: 'Confidentialité', href: '/confidentialite'         },
              { label: 'Contact',         href: 'mailto:contact@sakan.tn'  },
            ].map(({ label, href }) => (
              <li key={label}><Link href={href} className="transition-colors hover:text-white">{label}</Link></li>
            ))}
          </FooterCol>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ color: 'oklch(38% 0.01 70)', fontFamily: 'var(--font-sans)' }}>
          <p>© 2026 SAKAN · سكن. Tous droits réservés.</p>
          <p>Immobilier éthique · Tunisie</p>
        </div>
      </div>
    </footer>
  )
}
