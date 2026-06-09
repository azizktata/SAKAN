import { useMemo } from 'react'
import { type UseFormReturn, Controller } from 'react-hook-form'
import type { WizardSchema } from './publish-dialog'
import type { Location } from '@/lib/api'

interface Props {
  form: UseFormReturn<WizardSchema>
  locations: Location[]
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconPin() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  )
}

function IconCity() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
    </svg>
  )
}

function ChevronDown() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
      style={{ color: 'var(--color-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>
      {children}
    </p>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs mt-1.5" style={{ color: 'oklch(55% 0.18 25)' }}>{message}</p>
}

const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  borderColor: hasError ? 'oklch(55% 0.18 25)' : 'var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  borderRadius: '3px',
  borderWidth: '2px',
})

// ── Select with left icon ─────────────────────────────────────────────────────

function SelectField({ id, label, Icon, children, hasError, ...props }: {
  id: string; label: string; Icon: React.FC; hasError?: boolean; children: React.ReactNode
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div className="relative flex items-center">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--color-primary)' }}>
          <Icon />
        </div>
        <select
          id={id}
          {...props}
          className="w-full appearance-none border-2 pl-10 pr-9 py-3 text-sm font-medium focus:outline-none focus:ring-2"
          style={inputStyle(hasError)}
        >
          {children}
        </select>
        <ChevronDown />
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

type GovGroup = { id: number | string; name: string; slug: string; cities: Location[] }

export function Step2Location({ form, locations }: Props) {
  const { register, control, watch, setValue, formState: { errors } } = form

  const groups = useMemo<GovGroup[]>(() => {
    const govs   = locations.filter(l => l.parent_id === null)
    const cities = locations.filter(l => l.parent_id !== null)
    return govs.map(gov => ({
      id: gov.id, name: gov.name, slug: gov.slug,
      cities: cities.filter(c => String(c.parent_id) === String(gov.id)),
    }))
  }, [locations])

  // We store locationId as the city's DB id (string). Derive governorate from that.
  const locationId = watch('locationId') ?? ''

  const currentGroup = useMemo<GovGroup | undefined>(() => {
    if (!locationId) return groups[0]
    return groups.find(g => g.cities.some(c => String(c.id) === locationId)) ?? groups[0]
  }, [groups, locationId])

  const currentCity = useMemo<Location | undefined>(() => {
    if (!locationId) return currentGroup?.cities[0]
    return currentGroup?.cities.find(c => String(c.id) === locationId)
  }, [currentGroup, locationId])

  function handleGovernorate(govName: string) {
    const g = groups.find(g => g.name === govName)
    const firstCity = g?.cities[0]
    if (firstCity) setValue('locationId', String(firstCity.id), { shouldValidate: true })
  }

  function handleCity(cityId: string) {
    setValue('locationId', cityId, { shouldValidate: true })
  }

  if (!locations.length) {
    return (
      <div className="flex items-center gap-2 py-10 justify-center" style={{ color: 'var(--color-muted)' }}>
        <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        <span className="text-sm font-medium">Chargement des villes…</span>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Governorate + City — side by side */}
      <div className="grid grid-cols-2 gap-3">
        <SelectField
          id="pub-gov"
          label="Gouvernorat"
          Icon={IconPin}
          value={currentGroup?.name ?? ''}
          onChange={e => handleGovernorate(e.target.value)}
        >
          {groups.map(g => <option key={g.slug} value={g.name}>{g.name}</option>)}
        </SelectField>

        <SelectField
          id="pub-city"
          label="Ville / Délégation"
          Icon={IconCity}
          value={currentCity ? String(currentCity.id) : ''}
          onChange={e => handleCity(e.target.value)}
          hasError={false}
        >
          {(currentGroup?.cities ?? []).map(c => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </SelectField>
      </div>

      {/* Neighbourhood */}
      <div>
        <FieldLabel>
          Quartier / Zone{' '}
          <span style={{ color: 'var(--color-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(facultatif)</span>
        </FieldLabel>
        <input
          id="neighbourhood"
          type="text"
          placeholder="Ex : El Menzah, Cité El Ghazala, Centre-ville…"
          {...register('neighbourhood' as keyof WizardSchema)}
          className="w-full border-2 px-4 py-3 text-sm focus:outline-none focus:ring-2"
          style={inputStyle()}
        />
      </div>

      {/* Address */}
      <div>
        <FieldLabel>Adresse précise</FieldLabel>
        <input
          id="address"
          type="text"
          placeholder="Ex : 12 Rue Ibn Khaldoun"
          {...register('address')}
          className="w-full border-2 px-4 py-3 text-sm focus:outline-none focus:ring-2"
          style={inputStyle(!!errors.address)}
        />
        <FieldError message={errors.address?.message} />
      </div>

      {/* GPS coords */}
      <div>
        <FieldLabel>
          Coordonnées GPS{' '}
          <span style={{ color: 'var(--color-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(facultatif)</span>
        </FieldLabel>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Controller
              name="latitude"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude  36.8065"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  className="w-full border-2 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  style={inputStyle(!!errors.latitude)}
                />
              )}
            />
            <FieldError message={errors.latitude?.message} />
          </div>
          <div>
            <Controller
              name="longitude"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude  10.1815"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  className="w-full border-2 px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  style={inputStyle(!!errors.longitude)}
                />
              )}
            />
            <FieldError message={errors.longitude?.message} />
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
          Trouvez les coordonnées sur{' '}
          <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>
            Google Maps
          </a>{' '}
          en faisant un clic droit sur l&apos;emplacement.
        </p>
      </div>
    </div>
  )
}
