'use client'

import Image from 'next/image'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { propertiesApi, referenceApi, type Property, type Location, type Amenity } from '@/lib/api'
import { TYPES } from '@/data/property-types'

const MapView = dynamic(
  () => import('./MapView').then((m) => m.MapView),
  { ssr: false, loading: () => <div style={{ width: '100%', height: '100%', background: 'var(--color-bg)' }} /> }
)

// ── Constants ─────────────────────────────────────────────────────────────────

const TYPE_API: Record<string, string | undefined> = {
  'Tous': undefined,
  'Appartement': 'apartment',
  'Villa': 'villa',
  'Maison': 'house',
}

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Appartement',
  villa: 'Villa',
  house: 'Maison',
  land: 'Terrain',
  commercial: 'Commercial',
  office: 'Bureau',
}

const PER_PAGE = 9

function fmt(n: number) { return n.toLocaleString('fr-TN') }

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconGrid() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  )
}

function IconMap() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  )
}

function IconFilter() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
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

function IconChevronLeft() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
    </svg>
  )
}

function IconChevronRight() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ListingView() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [type,        setType]        = useState(() => searchParams.get('type') ?? 'Tous')
  const [mode,        setMode]        = useState<'vente' | 'location' | 'tous'>(() => {
    const p = searchParams.get('mode')
    return (p === 'vente' || p === 'location') ? p : 'tous'
  })
  const [view,        setView]        = useState<'grid' | 'map'>(() =>
    searchParams.get('view') === 'map' ? 'map' : 'grid'
  )
  const [locationId,  setLocationId]  = useState(() => searchParams.get('locationId') ?? '')
  const [minPrice,    setMinPrice]    = useState(() => searchParams.get('minPrice') ?? '')
  const [maxPrice,    setMaxPrice]    = useState(() => searchParams.get('maxPrice') ?? '')
  const [bedrooms,    setBedrooms]    = useState(() => Number(searchParams.get('bedrooms') ?? '0'))
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page,        setPage]        = useState(1)
  const [hoveredId,   setHoveredId]   = useState<string | null>(null)

  const [properties,  setProperties]  = useState<Property[]>([])
  const [total,       setTotal]       = useState(0)
  const [lastPage,    setLastPage]    = useState(1)
  const [loading,          setLoading]          = useState(true)
  const [locations,        setLocations]        = useState<Location[]>([])
  const [allAmenities,     setAllAmenities]     = useState<Amenity[]>([])
  const [selectedAmenities,setSelectedAmenities]= useState<string[]>(() =>
    (searchParams.get('amenities') ?? '').split(',').filter(Boolean)
  )

  const listPanelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    referenceApi.locations().then((r) => setLocations(r.data)).catch(() => {})
    referenceApi.amenities().then((r) => setAllAmenities(r.data)).catch(() => {})
  }, [])

  function handleSelectOnMap(id: string) {
    setHoveredId(id)
    const card = document.getElementById(`map-card-${id}`)
    card?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  // Sync filter state from URL changes
  useEffect(() => {
    const p = searchParams.get('mode')
    setMode((p === 'vente' || p === 'location') ? p : 'tous')
    const t = searchParams.get('type')
    setType(t && TYPES.includes(t as typeof TYPES[number]) ? t : 'Tous')
    setLocationId(searchParams.get('locationId') ?? '')
    setView(searchParams.get('view') === 'map' ? 'map' : 'grid')
    setMinPrice(searchParams.get('minPrice') ?? '')
    setMaxPrice(searchParams.get('maxPrice') ?? '')
    setBedrooms(Number(searchParams.get('bedrooms') ?? '0'))
    setSelectedAmenities((searchParams.get('amenities') ?? '').split(',').filter(Boolean))
    setPage(1)
  }, [searchParams])

  // Fetch from API whenever filters or page change
  useEffect(() => {
    let cancelled = false
    const isFirstPage = page === 1

    if (isFirstPage) {
      setLoading(true)
      setProperties([])
    }

    const timer = setTimeout(() => {
      propertiesApi.list({
        transaction_type: mode === 'vente' ? 'sale' : mode === 'location' ? 'rent' : undefined,
        property_type:    TYPE_API[type],
        location_id:      locationId || undefined,
        min_price:        minPrice ? Number(minPrice) : undefined,
        max_price:        maxPrice ? Number(maxPrice) : undefined,
        bedrooms:         bedrooms > 0 ? bedrooms : undefined,
        amenities:        selectedAmenities.length > 0 ? selectedAmenities.join(',') : undefined,
        page,
        per_page:         PER_PAGE,
      })
        .then((res) => {
          if (cancelled) return
          const d = res.data
          setProperties((prev) => isFirstPage ? d.data : [...prev, ...d.data])
          setTotal(d.total)
          setLastPage(d.last_page)
        })
        .catch(() => {
          if (!cancelled && isFirstPage) setProperties([])
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }, 300)

    return () => { cancelled = true; clearTimeout(timer) }
  }, [mode, type, locationId, minPrice, maxPrice, bedrooms, selectedAmenities, page])

  function updateParams(patch: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(patch).forEach(([k, v]) => {
      if (!v || v === 'Tous' || v === 'tous' || v === '0') {
        params.delete(k)
      } else {
        params.set(k, v)
      }
    })
    const qs = params.toString()
    router.replace(qs ? `/logements?${qs}` : '/logements', { scroll: false })
  }

  const locationName = locations.find((l) => String(l.id) === locationId)?.name ?? ''

  const activeFilters = [
    mode !== 'tous' && (mode === 'vente' ? 'Vente' : 'Location'),
    type !== 'Tous' && type,
    locationName    && locationName,
    minPrice        && `≥ ${fmt(Number(minPrice))} DT`,
    maxPrice        && `≤ ${fmt(Number(maxPrice))} DT`,
    bedrooms > 0    && `${bedrooms}+ ch.`,
    selectedAmenities.length > 0 && `${selectedAmenities.length} équipement${selectedAmenities.length > 1 ? 's' : ''}`,
  ].filter(Boolean) as string[]

  function resetAll() {
    setMode('tous'); setType('Tous'); setLocationId('')
    setMinPrice(''); setMaxPrice(''); setBedrooms(0); setSelectedAmenities([]); setPage(1)
    router.replace('/logements', { scroll: false })
  }

const modeLabel = mode === 'location' ? 'à louer' : mode === 'vente' ? 'à vendre' : 'disponibles'
  const hasMore   = page < lastPage

  return (
    <div className="min-h-screen pt-16" style={{ background: 'var(--color-bg)' }}>

      <Navbar />

      {/* ── Filter bar ───────────────────────────────────────────────────── */}
      <div
        className="sticky z-30"
        style={{ top: '64px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-3 flex flex-wrap items-center gap-2.5">

          {/* Vente / Location / Tous — desktop */}
          <div className="hidden md:flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
            {(['tous', 'vente', 'location'] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setPage(1); updateParams({ mode: m }) }}
                className="px-3 py-1.5 text-sm font-medium transition-colors duration-150 capitalize"
                style={mode === m
                  ? { background: 'var(--color-primary)', color: '#fff' }
                  : { background: 'transparent', color: 'var(--color-text-secondary)' }}>
                {m === 'tous' ? 'Tous' : m === 'vente' ? 'Vente' : 'Location'}
              </button>
            ))}
          </div>

          {/* Type — desktop */}
          <div className="hidden md:flex">
            <select
              value={type}
              onChange={(e) => { setType(e.target.value); setPage(1); updateParams({ type: e.target.value }) }}
              className="rounded-xl border pl-3 pr-3 py-1.5 text-sm w-44 focus:outline-none focus:ring-2"
              style={{
                borderColor: type !== 'Tous' ? 'var(--color-primary)' : 'var(--color-border)',
                color: type !== 'Tous' ? 'var(--color-text)' : 'var(--color-muted)',
                background: 'var(--color-bg)',
              }}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Location search — desktop */}
          <div className="hidden md:flex">
            <select
              value={locationId}
              onChange={(e) => { setLocationId(e.target.value); setPage(1); updateParams({ locationId: e.target.value }) }}
              className="rounded-xl border pl-3 pr-3 py-1.5 text-sm w-44 focus:outline-none focus:ring-2"
              style={{
                borderColor: locationId ? 'var(--color-primary)' : 'var(--color-border)',
                color: locationId ? 'var(--color-text)' : 'var(--color-muted)',
                background: 'var(--color-bg)',
              }}>
              <option value="">Toutes les villes</option>
              {locations.map((l) => (
                <option key={l.id} value={String(l.id)}>{l.name}</option>
              ))}
            </select>
          </div>

          {/* Budget — desktop */}
          <div className="hidden md:flex items-center gap-1">
            <input type="number" placeholder="Prix min" value={minPrice}
              onChange={(e) => { setMinPrice(e.target.value); setPage(1); updateParams({ minPrice: e.target.value }) }}
              className="rounded-xl border px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', background: 'var(--color-bg)' }} />
            <span className="text-xs" style={{ color: 'var(--color-muted)' }}>—</span>
            <input type="number" placeholder="Prix max" value={maxPrice}
              onChange={(e) => { setMaxPrice(e.target.value); setPage(1); updateParams({ maxPrice: e.target.value }) }}
              className="rounded-xl border px-3 py-1.5 text-sm w-28 focus:outline-none focus:ring-2"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', background: 'var(--color-bg)' }} />
          </div>

          {/* Advanced filters toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl border text-sm font-medium transition-colors duration-150"
            style={filtersOpen
              ? { borderColor: 'var(--color-primary)', color: 'var(--color-primary)', background: 'oklch(42% 0.09 155 / 0.06)' }
              : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', background: 'transparent' }}>
            <IconFilter />
            Affiner
            {activeFilters.length > 0 && (
              <span className="w-4 h-4 rounded-full text-[0.6rem] font-bold text-white flex items-center justify-center"
                style={{ background: 'var(--color-primary)' }}>
                {activeFilters.length}
              </span>
            )}
          </button>

          <div className="flex-1" />

          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
            <button onClick={() => { setView('grid'); updateParams({ view: 'grid' }) }}
              className="p-2 transition-colors"
              style={view === 'grid' ? { background: 'var(--color-primary)', color: '#fff' }
                : { background: 'transparent', color: 'var(--color-muted)' }}>
              <IconGrid />
            </button>
            <button onClick={() => { setView('map'); updateParams({ view: 'map' }) }}
              className="p-2 transition-colors"
              style={view === 'map' ? { background: 'var(--color-primary)', color: '#fff' }
                : { background: 'transparent', color: 'var(--color-muted)' }}>
              <IconMap />
            </button>
          </div>
        </div>

        {/* Advanced filters panel */}
        {filtersOpen && (
          <div className="border-t overflow-y-auto" style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', maxHeight: 'calc(100dvh - 130px)' }}>
            <div className="max-w-7xl mx-auto px-6 py-5 space-y-5">

              {/* Mobile-only primary filters */}
              <div className="grid grid-cols-1 gap-5 md:hidden">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--color-muted)' }}>Mode</p>
                  <div className="flex rounded-xl overflow-hidden border w-fit" style={{ borderColor: 'var(--color-border)' }}>
                    {(['tous', 'vente', 'location'] as const).map((m) => (
                      <button key={m} onClick={() => { setMode(m); setPage(1); updateParams({ mode: m }) }}
                        className="px-4 py-2 text-sm font-medium transition-colors"
                        style={mode === m
                          ? { background: 'var(--color-primary)', color: '#fff' }
                          : { background: 'transparent', color: 'var(--color-text-secondary)' }}>
                        {m === 'tous' ? 'Tous' : m === 'vente' ? 'Vente' : 'Location'}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--color-muted)' }}>Type de bien</p>
                  <select
                    value={type}
                    onChange={(e) => { setType(e.target.value); setPage(1); updateParams({ type: e.target.value }) }}
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{
                      borderColor: type !== 'Tous' ? 'var(--color-primary)' : 'var(--color-border)',
                      color: type !== 'Tous' ? 'var(--color-text)' : 'var(--color-muted)',
                      background: 'var(--color-bg)',
                    }}>
                    {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--color-muted)' }}>Localisation</p>
                  <select
                    value={locationId}
                    onChange={(e) => { setLocationId(e.target.value); setPage(1); updateParams({ locationId: e.target.value }) }}
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{
                      borderColor: locationId ? 'var(--color-primary)' : 'var(--color-border)',
                      color: locationId ? 'var(--color-text)' : 'var(--color-muted)',
                      background: 'var(--color-bg)',
                    }}>
                    <option value="">Toutes les villes</option>
                    {locations.map((l) => (
                      <option key={l.id} value={String(l.id)}>{l.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--color-muted)' }}>Budget (DT)</p>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" value={minPrice}
                      onChange={(e) => { setMinPrice(e.target.value); setPage(1); updateParams({ minPrice: e.target.value }) }}
                      className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', background: 'var(--color-bg)' }} />
                    <span className="text-xs shrink-0" style={{ color: 'var(--color-muted)' }}>—</span>
                    <input type="number" placeholder="Max" value={maxPrice}
                      onChange={(e) => { setMaxPrice(e.target.value); setPage(1); updateParams({ maxPrice: e.target.value }) }}
                      className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none"
                      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)', background: 'var(--color-bg)' }} />
                  </div>
                </div>
              </div>

              <div className="border-t md:hidden" style={{ borderColor: 'var(--color-border)' }} />

              {/* Advanced filters */}
              <div className="space-y-5">

                {/* Chambres */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--color-muted)' }}>Chambres min.</p>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <button key={n} onClick={() => { setBedrooms(n); setPage(1); updateParams({ bedrooms: String(n) }) }}
                        className="w-8 h-8 rounded-full text-xs font-semibold border transition-colors"
                        style={bedrooms === n
                          ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
                          : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                        {n === 0 ? 'T' : `${n}+`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                {allAmenities.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-2.5" style={{ color: 'var(--color-muted)' }}>Équipements</p>
                    <div className="flex flex-wrap gap-2">
                      {allAmenities.map((a) => {
                        const active = selectedAmenities.includes(String(a.id))
                        return (
                          <button key={a.id}
                            onClick={() => {
                              const next = active
                                ? selectedAmenities.filter((x) => x !== String(a.id))
                                : [...selectedAmenities, String(a.id)]
                              setSelectedAmenities(next)
                              setPage(1)
                              updateParams({ amenities: next.join(',') || null })
                            }}
                            className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors"
                            style={active
                              ? { background: 'var(--color-primary)', color: '#fff', borderColor: 'var(--color-primary)' }
                              : { borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)', background: 'transparent' }}>
                            {a.name}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer: count + reset */}
              <div className="pt-1 flex items-center justify-between">
                <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                  {loading ? '…' : `${total} résultat${total !== 1 ? 's' : ''}`}
                </p>
                {activeFilters.length > 0 && (
                  <button onClick={resetAll}
                    className="text-xs font-medium transition-colors hover:underline"
                    style={{ color: 'var(--color-primary)' }}>
                    Effacer tous les filtres
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Grid view ────────────────────────────────────────────────────── */}
      {view === 'grid' && (
        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* Result count + active chips */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <h1 className="font-display font-semibold" style={{ fontSize: '1.25rem', color: 'var(--color-text)' }}>
              {loading && properties.length === 0
                ? 'Recherche en cours…'
                : `${total.toLocaleString('fr-TN')} bien${total !== 1 ? 's' : ''} ${modeLabel}`}
            </h1>
            {activeFilters.map((f) => (
              <span key={f}
                className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
                style={{ background: 'oklch(42% 0.09 155 / 0.08)', color: 'var(--color-primary)' }}>
                {f}
              </span>
            ))}
          </div>

          {loading && properties.length === 0 ? (
            <div className="flex justify-center py-24">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
            </div>
          ) : properties.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-lg font-display font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                Aucun résultat
              </p>
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                Essayez d&apos;élargir vos critères de recherche.
              </p>
              <button onClick={resetAll}
                className="px-5 py-2 rounded-full text-sm font-semibold text-white"
                style={{ background: 'var(--color-primary)' }}>
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {properties.map((prop) => (
                <PropertyCard key={prop.id} prop={prop} />
              ))}
            </div>
          )}

          {/* Load more */}
          {hasMore && !loading && (
            <div className="mt-10 text-center">
              <button onClick={() => setPage((p) => p + 1)}
                className="px-8 py-3 rounded-full text-sm font-semibold border transition-all hover:shadow-md"
                style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)', background: 'transparent' }}>
                Voir plus de biens ({total - properties.length} restants)
              </button>
            </div>
          )}

          {loading && properties.length > 0 && (
            <div className="flex justify-center mt-8">
              <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
            </div>
          )}
        </div>
      )}

      {/* ── Map view ─────────────────────────────────────────────────────── */}
      {view === 'map' && (
        <div className="max-w-[1800px] pl-6 mx-auto w-full flex" style={{ height: 'calc(100vh - 113px)' }}>

          {/* Left: scrollable card list */}
          <div ref={listPanelRef} className="w-full lg:w-[380px] shrink-0 overflow-y-auto border-r"
            style={{ borderColor: 'var(--color-border)' }}>
            <div className="p-3 space-y-2.5">
              {loading && properties.length === 0 ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
                    style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
                </div>
              ) : properties.length === 0 ? (
                <div className="py-16 text-center px-4">
                  <p className="font-display font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                    Aucun résultat
                  </p>
                  <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                    Essayez d&apos;élargir vos critères.
                  </p>
                  <button onClick={resetAll}
                    className="px-5 py-2 rounded-full text-sm font-semibold text-white"
                    style={{ background: 'var(--color-primary)' }}>
                    Réinitialiser
                  </button>
                </div>
              ) : (
                properties.map((prop) => (
                  <div key={prop.id}
                    id={`map-card-${prop.id}`}
                    className="rounded-2xl overflow-hidden transition-all"
                    style={hoveredId === prop.id
                      ? { outline: '2px solid var(--color-primary)', outlineOffset: '1px' }
                      : undefined}
                    onMouseEnter={() => setHoveredId(prop.id)}
                    onMouseLeave={() => setHoveredId(null)}>
                    <PropertyCard prop={prop} />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Leaflet map (desktop only) */}
          <div className="hidden lg:block flex-1">
            <MapView
              properties={properties}
              hoveredId={hoveredId}
              onHover={setHoveredId}
              onSelect={handleSelectOnMap}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Property card ─────────────────────────────────────────────────────────────

function PropertyCard({ prop }: { prop: Property }) {
  const images     = prop.images ?? []
  const [imgIdx, setImgIdx] = useState(0)
  const hasMultiple = images.length > 1
  const cover      = images.find((i) => i.is_cover) ?? images[0]
  const currentImg = images[imgIdx] ?? cover
  const priceLabel = prop.transaction_type === 'rent' ? '/mois' : 'DT'
  const locationName = prop.location?.name ?? prop.address ?? ''
  const typeLabel  = PROPERTY_TYPE_LABELS[prop.property_type] ?? prop.property_type

  function prev(e: React.MouseEvent) {
    e.preventDefault()
    setImgIdx((i) => (i - 1 + images.length) % images.length)
  }

  function next(e: React.MouseEvent) {
    e.preventDefault()
    setImgIdx((i) => (i + 1) % images.length)
  }

  return (
    <Link href={`/logements/${prop.id}`}>
    <article
      className="group rounded-2xl overflow-hidden shadow-[0_2px_12px_rgb(0_0_0/0.06)] hover:shadow-[0_10px_36px_rgb(0_0_0/0.12)] transition-shadow duration-300 cursor-pointer"
      style={{ background: 'var(--color-surface)' }}
    >
      {/* Image with slideshow */}
      <div className="relative h-48 overflow-hidden">
        {currentImg ? (
          <Image
            src={currentImg.url}
            alt={prop.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full" style={{ background: 'var(--color-bg)' }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />

        {/* Property type badge */}
        <span className="absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full text-white"
          style={{ background: 'var(--color-primary)' }}>
          {typeLabel}
        </span>

        {/* Prev / Next arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={prev}
              aria-label="Image précédente"
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(0,0,0,0.4)' }}
            >
              <IconChevronLeft />
            </button>
            <button
              onClick={next}
              aria-label="Image suivante"
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-full flex items-center justify-center text-white"
              style={{ background: 'rgba(0,0,0,0.4)' }}
            >
              <IconChevronRight />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); setImgIdx(i) }}
                  aria-label={`Image ${i + 1}`}
                  className="w-1.5 h-1.5 rounded-full transition-colors"
                  style={{ background: i === imgIdx ? 'white' : 'rgba(255,255,255,0.45)' }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h2
          className="font-display font-semibold text-base leading-snug mb-1 transition-colors group-hover:text-[oklch(42%_0.09_155)]"
          style={{ color: 'var(--color-text)' }}
        >
          {prop.title}
        </h2>
        <p className="text-xs flex items-center gap-1 mb-3" style={{ color: 'var(--color-muted)' }}>
          <IconPin /> {locationName}
        </p>

        {/* Specs */}
        <div className="flex items-center gap-3 text-xs mb-3" style={{ color: 'var(--color-text-secondary)' }}>
          {prop.bedrooms != null && (
            <>
              <span>{prop.bedrooms}&thinsp;ch.</span>
              <span className="w-px h-3" style={{ background: 'var(--color-border)' }} aria-hidden="true" />
            </>
          )}
          {prop.bathrooms != null && (
            <>
              <span>{prop.bathrooms}&thinsp;sdb.</span>
              <span className="w-px h-3" style={{ background: 'var(--color-border)' }} aria-hidden="true" />
            </>
          )}
          {prop.surface != null && <span>{prop.surface}&thinsp;m²</span>}
          {prop.floor != null && prop.floor > 0 && (
            <>
              <span className="w-px h-3" style={{ background: 'var(--color-border)' }} aria-hidden="true" />
              <span>Ét.&thinsp;{prop.floor}</span>
            </>
          )}
        </div>

        {/* Amenity chips */}
        {(prop.amenities?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {prop.amenities!.slice(0, 3).map((a) => (
              <span key={a.id} className="text-[0.65rem] px-2 py-0.5 rounded-full"
                style={{ background: 'var(--color-bg)', color: 'var(--color-text-secondary)' }}>
                {a.name}
              </span>
            ))}
          </div>
        )}

        {/* Price + CTA */}
        <div className="flex items-end justify-between mt-1">
          <div>
            <p className="font-display font-bold tabular-nums" style={{ fontSize: '1.15rem', color: 'var(--color-text)' }}>
              {fmt(prop.price)}{' '}
              <span className="text-sm font-normal" style={{ color: 'var(--color-muted)' }}>{priceLabel}</span>
            </p>
            {prop.transaction_type === 'sale' && prop.surface && (
              <p className="text-[0.7rem]" style={{ color: 'var(--color-muted)' }}>
                {fmt(Math.round(prop.price / prop.surface))}&thinsp;DT/m²
              </p>
            )}
          </div>
        </div>
      </div>
    </article>
    </Link>
  )
}
