import { useEffect, useMemo, useState } from 'react'
import type { EstFormData } from './estimation-dialog'
import type { TransactionType, PropertyType } from '@/lib/estimation-engine'
import type { Location } from '@/lib/api'
import { referenceApi } from '@/lib/api'

// ── Icon library (monochrome SVG line icons) ──────────────────────────────────

function IconVente() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

function IconLocation() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
    </svg>
  )
}

function IconApartment() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  )
}

function IconVilla() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

function IconHouse() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h-4.5M3 16.5V8.25M21 16.5V8.25M3.75 3h16.5" />
    </svg>
  )
}

function IconLand() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  )
}

function IconCommercial() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  )
}

function IconOffice() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  )
}

function IconCity() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
    </svg>
  )
}

function IconList() {
  return (
    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 shrink-0"
      style={{ color: 'var(--color-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const TRANSACTION_TYPES: { value: TransactionType; label: string; desc: string; Icon: React.FC }[] = [
  { value: 'vente',    label: 'Vente',    desc: 'Estimer le prix de vente',   Icon: IconVente    },
  { value: 'location', label: 'Location', desc: 'Estimer le loyer mensuel',   Icon: IconLocation },
]

const PROPERTY_TYPES: { value: PropertyType; label: string; Icon: React.FC }[] = [
  { value: 'apartment',  label: 'Appartement', Icon: IconApartment },
  { value: 'villa',      label: 'Villa',        Icon: IconVilla     },
  { value: 'house',      label: 'Maison',       Icon: IconHouse     },
  { value: 'land',       label: 'Terrain',      Icon: IconLand      },
  { value: 'commercial', label: 'Commercial',   Icon: IconCommercial },
  { value: 'office',     label: 'Bureau',       Icon: IconOffice    },
]

type GovGroup = { id: number | string; name: string; slug: string; cities: Location[] }

// ── Select field ──────────────────────────────────────────────────────────────

function SelectField({ id, label, value, onChange, Icon, children }: {
  id: string; label: string; value: string; onChange: (v: string) => void
  Icon: React.FC; children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest block mb-2"
        style={{ color: 'var(--color-muted)' }}>
        {label}
      </label>
      <div className="relative flex items-center">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--color-primary)' }}>
          <Icon />
        </div>
        <select id={id} value={value} onChange={e => onChange(e.target.value)}
          className="w-full appearance-none pl-10 pr-9 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 transition-colors"
          style={{
            borderRadius: '3px', border: '2px solid var(--color-border)',
            background: 'var(--color-surface)', color: 'var(--color-text)',
          }}>
          {children}
        </select>
        <ChevronDown />
      </div>
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
      <span className="text-xs font-bold uppercase tracking-widest shrink-0" style={{ color: 'var(--color-muted)' }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: 'var(--color-border)' }} />
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { form: EstFormData; setForm: (f: EstFormData) => void }

export function EstStep1TypeLocation({ form, setForm }: Props) {
  const [locations, setLocations] = useState<Location[]>([])

  useEffect(() => {
    referenceApi.locations().then(r => setLocations(r.data)).catch(() => {})
  }, [])

  const groups = useMemo<GovGroup[]>(() => {
    const govs   = locations.filter(l => l.parent_id === null)
    const cities = locations.filter(l => l.parent_id !== null)
    return govs.map(gov => ({
      id: gov.id, name: gov.name, slug: gov.slug,
      cities: cities.filter(c => String(c.parent_id) === String(gov.id)),
    }))
  }, [locations])

  useEffect(() => {
    if (!groups.length) return
    const group = groups.find(g => g.name === form.governorate) ?? groups[0]
    if (!group?.cities.length) return
    const match = group.cities.find(c => c.slug === form.citySlug)
    if (!match) {
      const first = group.cities[0]
      setForm({ ...form, governorate: group.name, citySlug: first.slug, zoneScore: first.zone_score, latitude: first.latitude ?? null, longitude: first.longitude ?? null })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups])

  const currentGroup = useMemo(() => groups.find(g => g.name === form.governorate) ?? groups[0], [groups, form.governorate])
  const currentCity  = useMemo(() => currentGroup?.cities.find(c => c.slug === form.citySlug) ?? currentGroup?.cities[0], [currentGroup, form.citySlug])
  const neighborhoods = currentCity?.neighborhoods ?? []

  function handleGovernorate(govName: string) {
    const g = groups.find(g => g.name === govName) ?? groups[0]
    const f = g?.cities[0]
    setForm({ ...form, governorate: govName, citySlug: f?.slug ?? '', zoneScore: f?.zone_score ?? 1, latitude: f?.latitude ?? null, longitude: f?.longitude ?? null, neighborhood: '' })
  }

  function handleCity(citySlug: string) {
    const city = currentGroup?.cities.find(c => c.slug === citySlug)
    if (!city) return
    setForm({ ...form, citySlug: city.slug, zoneScore: city.zone_score, latitude: city.latitude ?? null, longitude: city.longitude ?? null, neighborhood: '' })
  }

  return (
    <div className="space-y-6">

      {/* ── Transaction type ────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
          Type de transaction
        </p>
        <div className="grid grid-cols-2 gap-3">
          {TRANSACTION_TYPES.map(({ value, label, desc, Icon }) => {
            const active = form.transactionType === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, transactionType: value })}
                className="relative text-left transition-all duration-200 overflow-hidden"
                style={{
                  borderRadius: '3px',
                  border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                  padding: '18px 16px',
                }}
              >
                <div
                  className="mb-3 w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: active ? 'oklch(100% 0 0 / 0.12)' : 'var(--color-surface-warm)',
                    color: active ? 'white' : 'var(--color-primary)',
                  }}
                >
                  <Icon />
                </div>
                <p className="font-display font-bold text-sm" style={{ color: active ? 'white' : 'var(--color-text)', letterSpacing: '-0.01em' }}>
                  {label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: active ? 'oklch(82% 0.012 70)' : 'var(--color-muted)' }}>
                  {desc}
                </p>
                {active && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--color-accent)' }} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Property type ────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
          Type de bien
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PROPERTY_TYPES.map(({ value, label, Icon }) => {
            const active = form.propertyType === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setForm({ ...form, propertyType: value })}
                className="flex flex-col items-center gap-2 py-3.5 px-2 text-center transition-all duration-150"
                style={{
                  borderRadius: '3px',
                  border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: active ? 'oklch(32% 0.08 130 / 0.06)' : 'var(--color-surface)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: active ? 'oklch(32% 0.08 130 / 0.12)' : 'var(--color-surface-warm)',
                    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  }}
                >
                  <Icon />
                </div>
                <span className="text-xs font-semibold leading-tight"
                  style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <SectionDivider label="Localisation" />

      {/* ── Location dropdowns ───────────────────────────────────────────── */}
      {!groups.length ? (
        <div className="flex items-center gap-2.5 py-6 justify-center" style={{ color: 'var(--color-muted)' }}>
          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          <span className="text-sm font-medium">Chargement des villes…</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <SelectField id="est-gov" label="Gouvernorat" value={currentGroup?.name ?? ''} onChange={handleGovernorate} Icon={IconPin}>
              {groups.map(g => <option key={g.slug} value={g.name}>{g.name}</option>)}
            </SelectField>

            {currentGroup && (
              <SelectField id="est-city" label="Ville / Délégation" value={currentCity?.slug ?? ''} onChange={handleCity} Icon={IconCity}>
                {currentGroup.cities.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </SelectField>
            )}
          </div>

          {neighborhoods.length > 0 && (
            <SelectField id="est-hood" label="Quartier (optionnel)" value={form.neighborhood} onChange={v => setForm({ ...form, neighborhood: v })} Icon={IconList}>
              <option value="">— Tout quartier —</option>
              {neighborhoods.map(n => <option key={n} value={n}>{n}</option>)}
            </SelectField>
          )}

        </div>
      )}
    </div>
  )
}
