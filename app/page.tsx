import Image from 'next/image'
import Link from 'next/link'
import { SearchBar } from '@/components/landing/search-bar'
import { Navbar } from '@/components/layout/navbar'
import { BrowseSection } from '@/components/landing/browse-section'
import type { Property, Paginated } from '@/lib/api'

// ── Data ─────────────────────────────────────────────────────────────────────

const API = process.env.NEXT_PUBLIC_API_URL

async function fetchFeatured(): Promise<Property[]> {
  try {
    const res = await fetch(`${API}/properties?per_page=6`, { cache: 'no-store' })
    if (!res.ok) return []
    const data: Paginated<Property> = await res.json()
    return data.data.slice(0, 6)
  } catch {
    return []
  }
}

const VALUES = [
  {
    n: '01', title: 'Transparence totale',
    body: 'Le prix affiché est le prix réel. Toutes les informations disponibles, sans ambiguïté.',
  },
  {
    n: '02', title: 'Éthique & Halal',
    body: 'Transactions directes, sans crédit caché ni pratiques douteuses.',
  },
  {
    n: '03', title: 'Simplicité radicale',
    body: 'Trouver ou publier un bien en quelques clics. Aucune friction inutile.',
  },
] as const

const STEPS = [
  {
    n: '01', title: 'Recherchez',
    body: 'Filtrez par superficie, localisation, budget, type et critères lifestyle — ascenseur, garage, proximité mosquée.',
  },
  {
    n: '02', title: 'Consultez',
    body: "Toutes les informations en un endroit. Photos, plan, équipements, carte. Rien de caché.",
  },
  {
    n: '03', title: 'Contactez',
    body: "Directement avec le propriétaire. Pas d'intermédiaire, pas de frais. Juste vous et le bien.",
  },
] as const

const INSPIRATION = [
  { img: '/prop-10.jpg', label: 'Villas & Maisons' },
  { img: '/prop-8.jpg',  label: 'Intérieurs'       },
  { img: '/prop-5.jpg',  label: 'Résidences'       },
  { img: '/prop-9.jpg',  label: 'Biens récents'    },
] as const

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString('fr-TN')
}

function fadeUp(delay = 0) {
  return {
    style: {
      animationName: 'fade-up', animationDuration: '700ms',
      animationDelay: `${delay}ms`,
      animationTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
      animationFillMode: 'both',
    } as React.CSSProperties,
  }
}

function IconArrow() {
  return (
    <svg aria-hidden="true" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg aria-hidden="true" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Appartement', villa: 'Villa', house: 'Maison',
  land: 'Terrain', commercial: 'Commercial', office: 'Bureau',
}

export default async function HomePage() {
  const featured = await fetchFeatured()
  return (
    <>
      <Navbar initialDark />

      <main>
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section
          className="relative flex flex-col justify-center items-center pt-20 pb-14 overflow-hidden"
          style={{ minHeight: '480px', maxHeight: '600px' }}
        >
          <Image
            src="/prop-2.jpg"
            alt="Cour intérieure d'une belle résidence tunisienne"
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          {/* Even overlay for centered layout */}
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to bottom, oklch(12% 0.015 155 / 0.35) 0%, oklch(20% 0.07 155 / 0.65) 60%, oklch(22% 0.07 155 / 0.80) 100%)',
          }} />

          <div className="relative z-10 max-w-3xl mx-auto px-6 w-full text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em]"
              style={{ color: 'var(--color-accent-light)', ...fadeUp(0).style }}>
             Vente & Location
            </p>
            <h1 className="hidden sm:block font-display font-semibold text-white leading-[1.1] mb-6"
              style={{ fontSize: 'clamp(1.6rem, 3.2vw, 2.25rem)', ...fadeUp(80).style }}>
              Commencer votre recherche
            </h1>
            {/* 
            <p className="text-white/60 mb-7 leading-relaxed mx-auto max-w-[38ch]"
              style={{ fontSize: '0.9375rem', ...fadeUp(160).style }}>
              Direct, sans crédit caché, sans frais d&apos;agence.
            </p> */}
            <div className="flex justify-center" {...fadeUp(240)}>
              <SearchBar />
            </div>

            {/* Quick-filter pills */}
            <div className="mt-4 flex flex-wrap justify-center gap-2" {...fadeUp(320)}>
              {[
                { label: 'Appartements à Tunis', href: '/logements?type=Appartement&location=tunis' },
                { label: 'Villas',               href: '/logements?type=Villa'                       },
                { label: 'Location',             href: '/logements?mode=location'                    },
                { label: 'Nouveaux biens',        href: '/logements?sort=recent'                     },
              ].map(({ label, href }) => (
                <Link key={label} href={href}
                 className="mt-3 text-[0.7rem] md:text-sm" style={{ color: 'oklch(85% 0.006 155 / 0.5)', ...fadeUp(420).style }}>
                  {label}
                </Link>
              ))}
            </div>

          </div>
        </section>

        {/* ── Browse by city + property type (client component with mode toggle) */}
        <BrowseSection />

        {/* ── Values — split: text + courtyard photo ───────────────────────── */}
        <section className="py-20 md:py-32 overflow-hidden" style={{ background: 'oklch(97.5% 0.008 80)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
              <div className="space-y-10">
                <div>
                  <h2 className="font-display font-semibold mb-3"
                    style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--color-text)' }}>
                    Pourquoi SAKAN
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    Une plateforme conçue autour de vos valeurs.
                  </p>
                </div>
                {VALUES.map((v) => (
                  <div key={v.n} className="flex gap-5">
                    <span className="font-display font-bold text-3xl leading-none mt-0.5 select-none shrink-0 w-10"
                      style={{ color: 'oklch(42% 0.09 155 / 0.18)' }}>
                      {v.n}
                    </span>
                    <div>
                      <h3 className="font-display font-semibold text-lg mb-1.5" style={{ color: 'var(--color-text)' }}>
                        {v.title}
                      </h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)', maxWidth: '38ch' }}>
                        {v.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="relative h-[480px] md:h-[560px] rounded-3xl overflow-hidden">
                <Image src="/prop-9.jpg" alt="Cour intérieure en pierre, Tunisie" fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover" />
                <div className="absolute inset-0 opacity-15" style={{ background: 'var(--color-primary-dark)' }} />
               
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────────────────────── */}
        <section className="py-20 md:py-28" style={{ background: 'var(--color-surface)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-14 max-w-xl">
              <h2 className="font-display font-semibold mb-4"
                style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)', color: 'var(--color-text)' }}>
                Comment ça marche
              </h2>
              <p className="leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                Pas de compte obligatoire pour consulter. Pensé pour aller à l&apos;essentiel.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {STEPS.map((step, i) => (
                <div key={step.n} className="flex gap-4">
                  <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-display"
                    style={{ background: 'oklch(42% 0.09 155 / 0.1)', color: 'var(--color-primary)' }}>
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-lg mb-2" style={{ color: 'var(--color-text)' }}>
                      {step.title}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {
          featured.length > 0 && (
        
        <section className="py-20 md:py-28" style={{ background: 'var(--color-bg)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display font-semibold mb-1"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-text)' }}>
                  Biens récents
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Ajoutés cette semaine.</p>
              </div>
              <Link href="/logements" className="hidden sm:flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{ color: 'var(--color-primary)' }}>
                Voir tout <IconArrow />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((prop) => {
                const cover = prop.images?.find((i) => i.is_cover) ?? prop.images?.[0]
                const typeLabel = PROPERTY_TYPE_LABELS[prop.property_type] ?? prop.property_type
                const modeLabel = prop.transaction_type === 'sale' ? 'Vente' : 'Location'
                const locationName = prop.location?.name ?? prop.address ?? ''
                return (
                  <Link key={prop.id} href={`/logements/${prop.id}`}>
                    <article
                      className="group rounded-3xl overflow-hidden shadow-[0_2px_16px_rgb(0_0_0/0.07)] hover:shadow-[0_12px_40px_rgb(0_0_0/0.13)] transition-shadow duration-300 cursor-pointer"
                      style={{ background: 'var(--color-surface)' }}>
                      <div className="relative h-52 overflow-hidden">
                        {cover ? (
                          <Image src={cover.url} alt={prop.title} fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="w-full h-full" style={{ background: 'var(--color-bg)' }} />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                        <div className="absolute bottom-3 right-3 rounded-md bg-black/30 px-2 py-1 text-[0.7rem] text-white backdrop-blur-sm">
                          {typeLabel} · {modeLabel}
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-display font-semibold leading-snug mb-1 transition-colors duration-150 group-hover:text-[oklch(42%_0.09_155)]"
                          style={{ color: 'var(--color-text)' }}>
                          {prop.title}
                        </h3>
                        <p className="text-xs flex items-center gap-1 mb-4" style={{ color: 'var(--color-muted)' }}>
                          <IconPin /> {locationName}
                        </p>
                        <div className="flex items-center gap-3 text-xs mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                          {prop.bedrooms != null && <><span>{prop.bedrooms}&thinsp;ch.</span><span className="w-px h-3 rounded" style={{ background: 'var(--color-border)' }} /></>}
                          {prop.bathrooms != null && <><span>{prop.bathrooms}&thinsp;sdb.</span><span className="w-px h-3 rounded" style={{ background: 'var(--color-border)' }} /></>}
                          {prop.surface != null && <span>{prop.surface}&thinsp;m²</span>}
                        </div>
                        <p className="font-display font-bold tabular-nums" style={{ fontSize: '1.25rem', color: 'var(--color-text)' }}>
                          {fmt(prop.price)}{' '}
                          <span className="text-sm font-normal" style={{ color: 'var(--color-muted)' }}>DT</span>
                        </p>
                      </div>
                    </article>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>
        )}

        {/* ── Inspiration grid — editorial ─────────────────────────────────── */}
        {/* <section className="py-20 md:py-28" style={{ background: 'var(--color-surface)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="font-display font-semibold mb-1"
                  style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', color: 'var(--color-text)' }}>
                  Découvrez nos biens
                </h2>
                <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  Des logements pensés pour votre famille.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4" style={{ gridAutoRows: '200px' }}>
              <div className="group relative rounded-2xl overflow-hidden row-span-2 col-span-1">
                <Image src={INSPIRATION[0].img} alt={INSPIRATION[0].label} fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
                <span className="absolute bottom-4 left-4 text-sm font-semibold text-white">{INSPIRATION[0].label}</span>
              </div>
              {INSPIRATION.slice(1).map((item) => (
                <div key={item.label} className="group relative rounded-2xl overflow-hidden">
                  <Image src={item.img} alt={item.label} fill
                    sizes="(max-width: 768px) 50vw, 22vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-3 left-3 text-xs font-semibold text-white">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section> */}
 
        {/* ── Owner CTA — split with photo ─────────────────────────────────── */}
        <section className="overflow-hidden" style={{ background: 'var(--color-primary-dark)' }}>
          <div className="max-w-7xl mx-auto grid md:grid-cols-2" style={{ minHeight: '420px' }}>
            <div className="flex flex-col justify-center px-8 md:px-12 py-16">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                style={{ color: 'var(--color-accent-light)' }}>
                Propriétaires
              </p>
              <h2 className="font-display font-semibold text-white leading-tight mb-5"
                style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.5rem)' }}>
                Vous avez un bien à vendre ou à louer&nbsp;?
              </h2>
              <p className="leading-relaxed mb-8 max-w-[44ch]" style={{ color: 'oklch(88% 0.01 250 / 0.65)' }}>
                Publiez gratuitement. Simple, rapide, sans commission. Devant des milliers d&apos;acheteurs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="?publish=open"
                  className="px-7 py-3.5 rounded-full text-sm font-semibold text-center transition-colors hover:bg-white/90"
                  style={{ background: 'var(--color-surface)', color: 'var(--color-primary-dark)' }}>
                  Publier gratuitement
                </Link>
                <Link href="/espace-client"
                  className="px-7 py-3.5 rounded-full text-sm font-semibold text-white text-center transition-colors hover:bg-white/10"
                  style={{ border: '1px solid oklch(100% 0 0 / 0.2)' }}>
                  Mon espace
                </Link>
              </div>
            </div>
            <div className="relative hidden md:block">
              <Image src="/prop-3.jpg" alt="Belle résidence" fill
                sizes="50vw" className="object-cover" />
              <div className="absolute inset-0"
                style={{ background: 'linear-gradient(to right, var(--color-primary-dark) 0%, transparent 40%)' }} />
            </div>
          </div>
        </section>

        {/* ── Trust bar ────────────────────────────────────────────────────── */}
        {/* <section className="py-16 border-t"
          style={{ background: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
          <div className="max-w-7xl mx-auto px-6">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '2 890+',  label: 'Biens disponibles'    },
                { value: '14 000+', label: 'Utilisateurs actifs'  },
                { value: '100%',    label: 'Transactions directes' },
                { value: '0 DT',    label: "Frais d'agence"        },
              ].map((s) => (
                <div key={s.label} className="text-center md:text-left">
                  <dt className="font-display font-bold tabular-nums mb-1"
                    style={{ fontSize: 'clamp(1.75rem, 3vw, 2.5rem)', color: 'var(--color-primary)' }}>
                    {s.value}
                  </dt>
                  <dd className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section> */}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="pt-16 pb-8" style={{ background: 'oklch(14% 0.015 250)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2.5 mb-4">
               
                <span className="font-display font-semibold text-lg text-white">SAKAN</span>
              </Link>
              <p className="text-sm leading-relaxed max-w-[24ch]" style={{ color: 'oklch(58% 0.008 250)' }}>
                Immobilier éthique et transparent pour la Tunisie.
              </p>
            </div>
            <FooterCol title="Vente" color="var(--color-primary-light)">
              {[
                { label: 'Appartements', href: '/logements?mode=vente&type=Appartement' },
                { label: 'Villas',       href: '/logements?mode=vente&type=Villa'       },
                { label: 'Maisons',      href: '/logements?mode=vente&type=Maison'      },
                { label: 'Terrains',     href: '/logements?mode=vente&type=Terrain'     },
              ].map((t) => (
                <li key={t.label}><Link href={t.href} className="hover:text-white transition-colors">{t.label}</Link></li>
              ))}
            </FooterCol>
            <FooterCol title="Location" color="var(--color-primary-light)">
              {[
                { label: 'Appartements', href: '/logements?mode=location&type=Appartement' },
                { label: 'Bureaux',      href: '/logements?mode=location&type=Bureaux'     },
                { label: 'Villas',       href: '/logements?mode=location&type=Villa'       },
                { label: 'Locaux',       href: '/logements?mode=location&type=Local+commercial' },
              ].map((t) => (
                <li key={t.label}><Link href={t.href} className="hover:text-white transition-colors">{t.label}</Link></li>
              ))}
            </FooterCol>
            <FooterCol title="Informations" color="var(--color-primary-light)">
              {[
                { label: 'Publier un bien', href: '?publish=open'         },
                { label: 'Mon espace',      href: '/espace-client'        },
                { label: 'CGU',             href: '/cgu'                  },
                { label: 'Confidentialité', href: '/confidentialite'      },
                { label: 'Contact',         href: 'mailto:contact@sakan.tn' },
              ].map(({ label, href }) => (
                <li key={label}><Link href={href} className="hover:text-white transition-colors">{label}</Link></li>
              ))}
            </FooterCol>
          </div>
          <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
            style={{ borderColor: 'oklch(25% 0.01 250)', color: 'oklch(45% 0.008 250)' }}>
            <p>© 2026 SAKAN · سكن. Tous droits réservés.</p>
            <p>Immobilier éthique · Tunisie</p>
          </div>
        </div>
      </footer>
    </>
  )
}

function FooterCol({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[0.6875rem] font-semibold uppercase tracking-widest mb-4" style={{ color }}>{title}</p>
      <ul className="space-y-2.5 text-sm" style={{ color: 'oklch(55% 0.008 250)' }}>{children}</ul>
    </div>
  )
}
