'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PropertyCardManage, type ManagedProperty } from '@/components/espace-client/property-card-manage'
import { propertiesApi } from '@/lib/api'

function toManaged(p: {
  id: string; title: string; price: number; status: string; transaction_type: string;
  location?: { name: string } | null; address?: string | null;
  images?: { url: string; is_cover: boolean }[]
}): ManagedProperty {
  const cover = p.images?.find((i) => i.is_cover) ?? p.images?.[0]
  return {
    id:       p.id,
    title:    p.title,
    location: p.location?.name ?? p.address ?? '—',
    price:    p.price,
    mode:     p.transaction_type === 'sale' ? 'vente' : 'location',
    status:   p.status as ManagedProperty['status'],
    image:    cover?.url ?? '/prop-1.jpg',
  }
}

export default function AnnoncesPage() {
  const [properties, setProperties] = useState<ManagedProperty[]>([])
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    propertiesApi.myList()
      .then((res) => setProperties(res.data.data.map(toManaged)))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function handleDelete(id: string) {
    propertiesApi.delete(id).catch(() => {})
    setProperties((prev) => prev.filter((p) => p.id !== id))
  }

  function handleToggleStatus(id: string, status: 'published' | 'draft') {
    propertiesApi.update(id, { status }).catch(() => {})
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

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : properties.length === 0 ? (
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
