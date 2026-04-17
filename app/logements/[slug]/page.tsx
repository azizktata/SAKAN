import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { ALL_PROPERTIES } from '@/data/properties'
import { Navbar } from '@/components/layout/navbar'
import { PropertyDetailClient } from './detail-client'

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return ALL_PROPERTIES.map((p) => ({ slug: String(p.id) }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const prop = ALL_PROPERTIES.find((p) => p.id === Number(slug))
  if (!prop) return {}
  const modeLabel = prop.mode === 'vente' ? 'à vendre' : 'à louer'
  return {
    title: `${prop.title} · ${prop.location} — SAKAN`,
    description: `${prop.type} ${modeLabel} à ${prop.location}. ${prop.area} m², ${prop.rooms} chambre${prop.rooms > 1 ? 's' : ''}. ${prop.price.toLocaleString('fr-TN')} DT.`,
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params
  const prop = ALL_PROPERTIES.find((p) => p.id === Number(slug))
  if (!prop) notFound()

  const similar = ALL_PROPERTIES
    .filter((p) => p.id !== prop.id && p.type === prop.type && p.mode === prop.mode)
    .slice(0, 3)

  return (
    <>
      <Navbar />
      <PropertyDetailClient prop={prop} similar={similar} />
    </>
  )
}
