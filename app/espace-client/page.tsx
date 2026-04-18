import Link from 'next/link'
import Image from 'next/image'
import { StatsCard } from '@/components/espace-client/stats-card'

// Mock data — replace with real API calls in Round 2
const MOCK_STATS = { published: 3, drafts: 1, contacts: 7 }

const MOCK_RECENT = [
  { id: '1', title: 'Appartement lumineux', location: 'Centre-ville, Tunis', price: 285000, mode: 'vente', status: 'published', image: '/prop-6.jpg' },
  { id: '2', title: 'Villa avec jardin',    location: 'La Marsa, Tunis',     price: 850000, mode: 'vente', status: 'draft',     image: '/prop-10.jpg' },
]

const MOCK_CONTACTS = [
  { id: '1', name: 'Sarra Mansouri', property: 'Appartement lumineux', message: 'Bonjour, est-ce que le bien est toujours disponible ?', date: '2026-04-17' },
  { id: '2', name: 'Karim Jebali',   property: 'Villa avec jardin',    message: "Je suis intéressé, pouvez-vous me donner plus d'informations ?", date: '2026-04-16' },
]

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: 'Publié',     color: 'var(--color-primary)',        bg: 'oklch(42% 0.09 155 / 0.08)' },
  draft:     { label: 'Brouillon',  color: 'var(--color-text-secondary)', bg: 'oklch(42% 0.009 155 / 0.06)' },
  sold:      { label: 'Vendu',      color: 'var(--color-accent)',         bg: 'oklch(68% 0.1 78 / 0.1)' },
  rented:    { label: 'Loué',       color: 'var(--color-accent)',         bg: 'oklch(68% 0.1 78 / 0.1)' },
}

function fmt(n: number) { return n.toLocaleString('fr-TN') }

export default function EspaceClientPage() {
  return (
    <main className="flex-1 px-6 py-8 max-w-4xl w-full">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--color-text)' }}>
            Bonjour, Ahmed 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Voici un aperçu de votre activité.
          </p>
        </div>
        <Link href="?publish=open"
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}>
          + Publier un bien
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatsCard label="Annonces publiées" value={MOCK_STATS.published} />
        <StatsCard label="Brouillons"         value={MOCK_STATS.drafts}   color="var(--color-text-secondary)" />
        <StatsCard label="Demandes reçues"    value={MOCK_STATS.contacts}  color="var(--color-accent)" />
      </div>

      {/* Recent listings */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold" style={{ color: 'var(--color-text)' }}>Mes annonces récentes</h2>
          <Link href="/espace-client/annonces" className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
            Voir tout →
          </Link>
        </div>
        <div className="space-y-3">
          {MOCK_RECENT.map((prop) => {
            const s = STATUS_LABELS[prop.status] ?? STATUS_LABELS.draft
            return (
              <div key={prop.id} className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0">
                  <Image src={prop.image} alt={prop.title} fill sizes="64px" className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>{prop.title}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>{prop.location}</p>
                  <p className="font-display font-semibold text-sm mt-1 tabular-nums" style={{ color: 'var(--color-text)' }}>
                    {fmt(prop.price)} DT
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{ color: s.color, background: s.bg }}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* Recent contacts */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold" style={{ color: 'var(--color-text)' }}>Dernières demandes</h2>
          <Link href="/espace-client/contacts" className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
            Voir tout →
          </Link>
        </div>
        <div className="space-y-3">
          {MOCK_CONTACTS.map((c) => (
            <div key={c.id} className="p-4 rounded-2xl"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{c.name}</p>
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>{c.date}</p>
              </div>
              <p className="text-xs mb-1" style={{ color: 'var(--color-primary)' }}>Re : {c.property}</p>
              <p className="text-sm leading-relaxed truncate" style={{ color: 'var(--color-text-secondary)' }}>{c.message}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
