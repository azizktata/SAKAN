'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { StatsCard } from '@/components/espace-client/stats-card'
import { useAuth } from '@/lib/auth-context'
import { propertiesApi, type Property, type Contact } from '@/lib/api'

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: 'Publié',    color: 'var(--color-primary)',        bg: 'oklch(42% 0.09 155 / 0.08)' },
  draft:     { label: 'Brouillon', color: 'var(--color-text-secondary)', bg: 'oklch(42% 0.009 155 / 0.06)' },
  sold:      { label: 'Vendu',     color: 'var(--color-accent)',         bg: 'oklch(68% 0.1 78 / 0.1)' },
  rented:    { label: 'Loué',      color: 'var(--color-accent)',         bg: 'oklch(68% 0.1 78 / 0.1)' },
}

function fmt(n: number) { return n.toLocaleString('fr-TN') }

export default function EspaceClientPage() {
  const { user, logout } = useAuth()
  const [properties, setProperties] = useState<Property[]>([])
  const [contacts, setContacts]     = useState<Contact[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([propertiesApi.myList(), propertiesApi.myContacts()])
      .then(([propsRes, contactsRes]) => {
        setProperties(propsRes.data.data)
        setContacts(contactsRes.data.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const published = properties.filter((p) => p.status === 'published').length
  const drafts    = properties.filter((p) => p.status === 'draft').length
  const firstName = user?.name?.split(' ')[0] ?? 'vous'

  return (
    <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-4xl w-full">
      <div className="mb-6 sm:mb-8 flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-semibold text-xl sm:text-2xl" style={{ color: 'var(--color-text)' }}>
            Bonjour, {firstName} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            Voici un aperçu de votre activité.
          </p>
        </div>
        <Link href="?publish=open"
          className="shrink-0 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}>
          + Publier
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
        <StatsCard label="Annonces publiées" value={published} />
        <StatsCard label="Brouillons"         value={drafts}   color="var(--color-text-secondary)" />
        <StatsCard label="Demandes reçues"    value={contacts.length} color="var(--color-accent)" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <>
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold" style={{ color: 'var(--color-text)' }}>Mes annonces récentes</h2>
              <Link href="/espace-client/annonces" className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                Voir tout →
              </Link>
            </div>
            {properties.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Aucune annonce pour l'instant.</p>
            ) : (
              <div className="space-y-3">
                {properties.slice(0, 3).map((prop) => {
                  const s     = STATUS_LABELS[prop.status] ?? STATUS_LABELS.draft
                  const cover = prop.images?.find((i) => i.is_cover) ?? prop.images?.[0]
                  return (
                    <div key={prop.id} className="flex items-center gap-4 p-4 rounded-2xl"
                      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gray-100">
                        {cover && <Image src={cover.url} alt={prop.title} fill sizes="64px" className="object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: 'var(--color-text)' }}>{prop.title}</p>
                        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--color-muted)' }}>
                          {prop.location?.name ?? prop.address ?? '—'}
                        </p>
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
            )}
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold" style={{ color: 'var(--color-text)' }}>Dernières demandes</h2>
              <Link href="/espace-client/contacts" className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
                Voir tout →
              </Link>
            </div>
            {contacts.length === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Aucune demande pour l'instant.</p>
            ) : (
              <div className="space-y-3">
                {contacts.slice(0, 3).map((c) => (
                  <div key={c.id} className="p-4 rounded-2xl"
                    style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{c.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                        {new Date(c.created_at).toLocaleDateString('fr-TN')}
                      </p>
                    </div>
                    {c.property && (
                      <p className="text-xs mb-1" style={{ color: 'var(--color-primary)' }}>Re : {c.property.title}</p>
                    )}
                    <p className="text-sm leading-relaxed truncate" style={{ color: 'var(--color-text-secondary)' }}>
                      {c.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* Mobile-only quick actions */}
      <div className="flex sm:hidden flex-col gap-2 mt-4">
        <Link
          href="/"
          className="flex items-center justify-between px-4 py-3.5 rounded-2xl"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Retour à l'accueil</span>
          <span style={{ color: 'var(--color-muted)' }}>→</span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center justify-center px-4 py-3.5 rounded-2xl text-sm font-medium"
          style={{ background: 'oklch(52% 0.15 25 / 0.06)', color: 'oklch(45% 0.15 25)' }}
        >
          Déconnexion
        </button>
      </div>
    </main>
  )
}
