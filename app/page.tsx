import { Navbar } from '@/components/layout/navbar'
import { SiteFooter } from '@/components/layout/site-footer'
import { HeroSection } from '@/components/landing/hero-section'
import { BrowseSection } from '@/components/landing/browse-section'
import { BudgetSection } from '@/components/landing/budget-section'
import { LifestyleSection } from '@/components/landing/lifestyle-section'
import { PrinciplesSection } from '@/components/landing/principles-section'
import { FeaturedSection } from '@/components/landing/featured-section'
import { EstimationCta } from '@/components/landing/estimation-cta'
import { OwnerCta } from '@/components/landing/owner-cta'
import type { Property, Location, Paginated } from '@/lib/api'

const API = process.env.API_URL ?? 'http://localhost:8000/api'

async function fetchProperties(type: 'sale' | 'rent', count = 20): Promise<Property[]> {
  try {
    const res = await fetch(
      `${API}/properties?per_page=${count}&transaction_type=${type}`,
      { next: { revalidate: 300 }, signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return []
    const data: Paginated<Property> = await res.json()
    return data.data.filter((p) => p.images && p.images.length > 0)
  } catch {
    return []
  }
}

async function fetchLocations(): Promise<Location[]> {
  try {
    const res = await fetch(
      `${API}/locations`,
      { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) }
    )
    if (!res.ok) return []
    return await res.json()
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [saleProperties, rentProperties, locations] = await Promise.all([
    fetchProperties('sale', 20),
    fetchProperties('rent', 20),
    fetchLocations(),
  ])

  return (
    <>
      <Navbar initialDark />
      <main>
        <HeroSection
          saleProperties={saleProperties}
          rentProperties={rentProperties}
          locations={locations}
        />
        <BrowseSection />
        <BudgetSection />
        <LifestyleSection />
        <PrinciplesSection />
        <FeaturedSection
          saleProperties={saleProperties}
          rentProperties={rentProperties}
        />
        <EstimationCta />
        <OwnerCta />
      </main>
      <SiteFooter />
    </>
  )
}
