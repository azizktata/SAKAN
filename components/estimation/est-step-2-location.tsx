import { useEffect, useMemo, useState } from 'react'
import type { EstFormData } from './estimation-dialog'
import type { Location } from '@/lib/api'
import { referenceApi } from '@/lib/api'

type GovGroup = {
  id:     number | string
  name:   string
  slug:   string
  cities: Location[]
}

function ChevronDown() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
      style={{ color: 'var(--color-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function SelectField({ id, label, value, onChange, children }: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  children: React.ReactNode
}) {
  return (
    <div>
      <label htmlFor={id} className="text-xs font-semibold uppercase tracking-wider block mb-2"
        style={{ color: 'var(--color-muted)' }}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl border px-4 py-3 pr-9 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
        >
          {children}
        </select>
        <ChevronDown />
      </div>
    </div>
  )
}

interface Props {
  form:    EstFormData
  setForm: (f: EstFormData) => void
}

export function EstStep2Location({ form, setForm }: Props) {
  const [locations, setLocations] = useState<Location[]>([])

  useEffect(() => {
    referenceApi.locations().then((r) => setLocations(r.data)).catch(() => {/* ignore — empty list shows gracefully */})
  }, [])

  // Build governorate groups: parent_id === null → governorate; else → city under parent
  const groups = useMemo<GovGroup[]>(() => {
    const govs    = locations.filter(l => l.parent_id === null)
    const cities  = locations.filter(l => l.parent_id !== null)
    return govs.map(gov => ({
      id:     gov.id,
      name:   gov.name,
      slug:   gov.slug,
      cities: cities.filter(c => String(c.parent_id) === String(gov.id)),
    }))
  }, [locations])

  // Once locations load, ensure form.citySlug matches an actual city (not a gov slug like 'tunis')
  useEffect(() => {
    if (!groups.length) return
    const group = groups.find(g => g.name === form.governorate) ?? groups[0]
    if (!group || !group.cities.length) return
    const cityMatch = group.cities.find(c => c.slug === form.citySlug)
    if (!cityMatch) {
      const first = group.cities[0]
      setForm({
        ...form,
        governorate: group.name,
        citySlug:    first.slug,
        zoneScore:   first.zone_score,
        latitude:    first.latitude  ?? null,
        longitude:   first.longitude ?? null,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groups])

  const currentGroup = useMemo(
    () => groups.find(g => g.name === form.governorate) ?? groups[0],
    [groups, form.governorate]
  )

  const currentCity = useMemo(() => {
    if (!currentGroup) return undefined
    return currentGroup.cities.find(c => c.slug === form.citySlug) ?? currentGroup.cities[0]
  }, [currentGroup, form.citySlug])

  const neighborhoods = currentCity?.neighborhoods ?? []

  function handleGovernorateChange(govName: string) {
    const group = groups.find(g => g.name === govName) ?? groups[0]
    const first = group?.cities[0]
    setForm({
      ...form,
      governorate:  govName,
      citySlug:     first?.slug ?? '',
      zoneScore:    first?.zone_score ?? 1,
      latitude:     first?.latitude  ?? null,
      longitude:    first?.longitude ?? null,
      neighborhood: '',
    })
  }

  function handleCityChange(citySlug: string) {
    const city = currentGroup?.cities.find(c => c.slug === citySlug)
    if (!city) return
    setForm({
      ...form,
      citySlug:     city.slug,
      zoneScore:    city.zone_score,
      latitude:     city.latitude  ?? null,
      longitude:    city.longitude ?? null,
      neighborhood: '',
    })
  }

  function handleNeighborhoodChange(neighborhood: string) {
    setForm({ ...form, neighborhood })
  }

  if (!groups.length) {
    return (
      <div className="flex items-center justify-center py-10" style={{ color: 'var(--color-muted)' }}>
        <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Chargement des villes…
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Governorate */}
      <SelectField id="est-gov" label="Gouvernorat" value={currentGroup?.name ?? ''} onChange={handleGovernorateChange}>
        {groups.map(g => (
          <option key={g.slug} value={g.name}>{g.name}</option>
        ))}
      </SelectField>

      {/* City */}
      {currentGroup && (
        <SelectField
          id="est-city"
          label="Ville / Délégation"
          value={currentCity?.slug ?? ''}
          onChange={handleCityChange}
        >
          {currentGroup.cities.map(c => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </SelectField>
      )}

      {/* Neighborhood — only shown when the selected city has neighborhoods */}
      {neighborhoods.length > 0 && (
        <SelectField id="est-hood" label="Quartier (optionnel)" value={form.neighborhood} onChange={handleNeighborhoodChange}>
          <option value="">— Tout quartier —</option>
          {neighborhoods.map(n => (
            <option key={n} value={n}>{n}</option>
          ))}
        </SelectField>
      )}

      {/* Info box */}
      <p className="text-xs leading-relaxed rounded-xl p-3.5"
        style={{ background: 'oklch(42% 0.09 155 / 0.06)', color: 'var(--color-primary)' }}>
        Les prix de référence sont basés sur les données du marché tunisien 2024–2025.
        L&apos;estimation est indicative et peut varier selon le quartier précis.
      </p>
    </div>
  )
}
