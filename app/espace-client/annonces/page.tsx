'use client'

import Link from 'next/link'
import { useState } from 'react'
import { PropertyCardManage, type ManagedProperty } from '@/components/espace-client/property-card-manage'

const MOCK: ManagedProperty[] = [
  { id: '1', title: 'Appartement lumineux au centre-ville', location: 'Centre-ville, Tunis',  price: 285000, mode: 'vente',    status: 'published', image: '/prop-6.jpg'  },
  { id: '2', title: 'Villa avec jardin privé',              location: 'La Marsa, Tunis',       price: 850000, mode: 'vente',    status: 'draft',     image: '/prop-10.jpg' },
  { id: '3', title: 'Studio moderne à Sousse',              location: 'Centre, Sousse',         price: 1200,   mode: 'location', status: 'published', image: '/prop-4.jpg'  },
]

export default function AnnoncesPage() {
  const [properties, setProperties] = useState<ManagedProperty[]>(MOCK)

  function handleDelete(id: string) {
    setProperties((prev) => prev.filter((p) => p.id !== id))
  }

  function handleToggleStatus(id: string, status: 'published' | 'draft') {
    setProperties((prev) => prev.map((p) => p.id === id ? { ...p, status } : p))
  }

  return (
    <main className="flex-1 px-6 py-8 max-w-4xl w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--color-text)' }}>
            Mes annonces
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {properties.length} bien{properties.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="?publish=open"
          className="px-5 py-2.5 rounded-full text-sm font-semibold text-white"
          style={{ background: 'var(--color-primary)' }}>
          + Publier
        </Link>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🏠</p>
          <p className="font-display font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Aucune annonce pour l'instant
          </p>
          <p className="text-sm mb-6" style={{ color: 'var(--color-text-secondary)' }}>
            Publiez votre premier bien en quelques minutes.
          </p>
          <Link href="?publish=open"
            className="inline-block px-6 py-3 rounded-full text-sm font-semibold text-white"
            style={{ background: 'var(--color-primary)' }}>
            Publier un bien
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((p) => (
            <PropertyCardManage
              key={p.id}
              property={p}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ))}
        </div>
      )}
    </main>
  )
}
