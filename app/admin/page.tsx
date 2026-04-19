'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { StatsCard } from '@/components/espace-client/stats-card'
import { adminApi, type Property, type User } from '@/lib/api'

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: 'Publié',    color: 'var(--color-primary)',        bg: 'oklch(42% 0.09 155 / 0.08)' },
  draft:     { label: 'Brouillon', color: 'var(--color-text-secondary)', bg: 'oklch(42% 0.009 155 / 0.06)' },
  sold:      { label: 'Vendu',     color: 'var(--color-accent)',         bg: 'oklch(68% 0.1 78 / 0.1)' },
  rented:    { label: 'Loué',      color: 'var(--color-accent)',         bg: 'oklch(68% 0.1 78 / 0.1)' },
}

const TYPE_LABELS: Record<string, string> = {
  apartment: 'Appartement', villa: 'Villa', house: 'Maison',
  land: 'Terrain', commercial: 'Commercial', office: 'Bureau',
}

export default function AdminPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [users, setUsers]           = useState<User[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    Promise.all([adminApi.properties(), adminApi.users()])
      .then(([propsRes, usersRes]) => {
        setProperties(propsRes.data)
        setUsers(usersRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const published = properties.filter((p) => p.status === 'published').length
  const drafts    = properties.filter((p) => p.status === 'draft').length

  return (
    <main className="flex-1 px-6 py-8 max-w-4xl w-full">
      <div className="mb-8">
        <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--color-text)' }}>
          Tableau de bord
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Vue d'ensemble de la plateforme SAKAN.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Biens publiés"  value={published} />
        <StatsCard label="Brouillons"     value={drafts}   color="var(--color-text-secondary)" />
        <StatsCard label="Total biens"    value={properties.length} />
        <StatsCard label="Utilisateurs"   value={users.length} color="var(--color-accent)" />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold" style={{ color: 'var(--color-text)' }}>
              Annonces récentes
            </h2>
            <Link href="/admin/annonces" className="text-xs font-medium" style={{ color: 'var(--color-primary)' }}>
              Voir tout →
            </Link>
          </div>
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: 'oklch(96% 0.005 155)' }}>
                  {['Titre', 'Type', 'Statut', 'Date'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide"
                      style={{ color: 'var(--color-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y" style={{ background: 'var(--color-surface)' }}>
                {properties.slice(0, 5).map((p) => {
                  const s = STATUS_META[p.status] ?? STATUS_META.draft
                  return (
                    <tr key={p.id}>
                      <td className="px-4 py-3 font-medium truncate max-w-[200px]" style={{ color: 'var(--color-text)' }}>
                        {p.title}
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--color-text-secondary)' }}>
                        {TYPE_LABELS[p.property_type] ?? p.property_type}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                          style={{ color: s.color, background: s.bg }}>
                          {s.label}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ color: 'var(--color-muted)' }}>
                        {new Date(p.created_at).toLocaleDateString('fr-TN')}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </main>
  )
}
