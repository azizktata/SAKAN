import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Property, Paginated } from '@/lib/api'
import { Navbar } from '@/components/layout/navbar'
import { PropertyDetailClient } from './detail-client'

type Props = { params: Promise<{ slug: string }> }

const API = process.env.API_URL

async function fetchProperty(id: string): Promise<Property | null> {
  try {
    const res = await fetch(`${API}/properties/${id}`, { cache: 'no-store' })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function fetchSimilar(prop: Property): Promise<Property[]> {
  try {
    const params = new URLSearchParams({
      property_type:    prop.property_type,
      transaction_type: prop.transaction_type,
      per_page:         '4',
    })
    const res = await fetch(`${API}/properties?${params}`, { cache: 'no-store' })
    if (!res.ok) return []
    const data: Paginated<Property> = await res.json()
    return data.data.filter((p) => p.id !== prop.id).slice(0, 3)
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const prop = await fetchProperty(slug)
  if (!prop) return {}
  const modeLabel  = prop.transaction_type === 'sale' ? 'à vendre' : 'à louer'
  const location   = prop.location?.name ?? prop.address ?? ''
  const cover      = prop.images?.find((i) => i.is_cover) ?? prop.images?.[0]
  return {
    title:       `${prop.title} · ${location} — SAKAN`,
    description: `${prop.property_type} ${modeLabel} à ${location}.${prop.surface ? ` ${prop.surface} m².` : ''}${prop.bedrooms ? ` ${prop.bedrooms} chambre${prop.bedrooms > 1 ? 's' : ''}.` : ''} ${prop.price.toLocaleString('fr-TN')} DT.`,
    openGraph:   cover ? { images: [cover.url] } : undefined,
  }
}

export default async function PropertyDetailPage({ params }: Props) {
  const { slug } = await params
  const prop = await fetchProperty(slug)
  if (!prop) notFound()

  const similar = await fetchSimilar(prop)

  return (
    <>
      <Navbar />
      <PropertyDetailClient prop={prop} similar={similar} />
    </>
  )
}
