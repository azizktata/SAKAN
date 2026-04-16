import { Suspense } from 'react'
import { ListingView } from '@/components/listing/listing-view'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Logements à vendre et à louer · SAKAN',
  description:
    'Parcourez des milliers de biens immobiliers en Tunisie. Appartements, villas, maisons, terrains — vente et location.',
}

export default function LogementsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen" style={{ background: 'var(--color-bg)' }} />
      }
    >
      <ListingView />
    </Suspense>
  )
}
