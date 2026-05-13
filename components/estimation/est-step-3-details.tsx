import type { EstFormData, BuildingYearRange } from './estimation-dialog'
import type { Condition } from '@/lib/estimation-engine'

const CONDITIONS: { value: Condition; label: string; desc: string }[] = [
  { value: 'neuf',      label: 'Neuf / récent',  desc: '< 5 ans ou entièrement rénové' },
  { value: 'bon_etat',  label: 'Bon état',        desc: 'Entretenu, sans travaux' },
  { value: 'a_renover', label: 'À rénover',       desc: 'Travaux importants nécessaires' },
]

const YEAR_RANGES: { value: BuildingYearRange; label: string }[] = [
  { value: '2020+',     label: '2020+' },
  { value: '2010-2019', label: '2010–2019' },
  { value: '2000-2009', label: '2000–2009' },
  { value: '1990-1999', label: '1990–1999' },
  { value: '1980-1989', label: '1980–1989' },
  { value: 'avant-1980', label: 'Avant 1980' },
]

type AmenityKey = keyof Pick<EstFormData,
  'isFurnished' | 'hasParking' | 'hasElevator' | 'hasGarden' | 'hasPool' |
  'hasTerrace' | 'hasBalcony' | 'hasSecurity' | 'hasAirConditioning' | 'hasHeating'
>

type AmenityDef = {
  key: AmenityKey
  label: string
  icon: string
  subInput?: 'parkingSpaces' | 'gardenSurface' | 'terraceSurface'
}

const AMENITIES: AmenityDef[] = [
  { key: 'isFurnished',        label: 'Meublé',        icon: '🛋️' },
  { key: 'hasParking',         label: 'Parking',        icon: '🚗', subInput: 'parkingSpaces' },
  { key: 'hasElevator',        label: 'Ascenseur',      icon: '🛗' },
  { key: 'hasGarden',          label: 'Jardin',         icon: '🌿', subInput: 'gardenSurface' },
  { key: 'hasPool',            label: 'Piscine',        icon: '🏊' },
  { key: 'hasTerrace',         label: 'Terrasse',       icon: '☀️', subInput: 'terraceSurface' },
  { key: 'hasBalcony',         label: 'Balcon',         icon: '🏗️' },
  { key: 'hasSecurity',        label: 'Sécurité',       icon: '🔒' },
  { key: 'hasAirConditioning', label: 'Climatisation',  icon: '❄️' },
  { key: 'hasHeating',         label: 'Chauffage',      icon: '🔥' },
]

function Stepper({ label, value, onChange, min = 0 }: {
  label: string; value: number; onChange: (n: number) => void; min?: number
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border flex items-center justify-center text-lg font-medium transition-colors"
          style={{
            borderColor: 'var(--color-border)',
            color: value <= min ? 'var(--color-muted)' : 'var(--color-text)',
          }}
        >−</button>
        <span className="w-6 text-center font-display font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full border flex items-center justify-center text-lg font-medium transition-colors"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        >+</button>
      </div>
    </div>
  )
}

interface Props {
  form: EstFormData
  setForm: (f: EstFormData) => void
}

export function EstStep3Details({ form, setForm }: Props) {
  function set<K extends keyof EstFormData>(key: K, value: EstFormData[K]) {
    setForm({ ...form, [key]: value })
  }

  function toggleAmenity(key: AmenityKey, subInput?: AmenityDef['subInput']) {
    const next = !form[key]
    const patch: Partial<EstFormData> = { [key]: next }
    // Reset sub-input when deselecting
    if (!next && subInput) {
      if (subInput === 'parkingSpaces') patch.parkingSpaces = 1
      if (subInput === 'gardenSurface') patch.gardenSurface = 0
      if (subInput === 'terraceSurface') patch.terraceSurface = 0
    }
    setForm({ ...form, ...patch })
  }

  return (
    <div className="space-y-5">
      {/* Surface */}
      <div>
        <label htmlFor="est-surface" className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-muted)' }}>
          Surface (m²)
        </label>
        <input
          id="est-surface"
          type="number"
          min={1}
          value={form.surface}
          onChange={(e) => set('surface', Math.max(1, parseInt(e.target.value) || 1))}
          className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
        />
      </div>

      {/* Steppers */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <div className="px-4">
          <Stepper label="Chambres"       value={form.bedrooms}  onChange={(n) => set('bedrooms', n)}  min={0} />
          <Stepper label="Salles de bain" value={form.bathrooms} onChange={(n) => set('bathrooms', n)} min={0} />
          <Stepper label="Étage"          value={form.floor}     onChange={(n) => set('floor', n)}     min={0} />
        </div>
      </div>

      {/* Condition */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
          État du bien
        </p>
        <div className="space-y-2">
          {CONDITIONS.map((c) => {
            const active = form.condition === c.value
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => set('condition', c.value)}
                className="w-full rounded-2xl p-3.5 text-left border-2 transition-all"
                style={{
                  borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                  background:  active ? 'oklch(42% 0.09 155 / 0.06)' : 'var(--color-bg)',
                }}
              >
                <p className="text-sm font-semibold" style={{ color: active ? 'var(--color-primary)' : 'var(--color-text)' }}>{c.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{c.desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Construction year */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
          Année de construction <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>(optionnel)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {YEAR_RANGES.map((yr) => {
            const active = form.buildingYearRange === yr.value
            return (
              <button
                key={yr.value}
                type="button"
                onClick={() => set('buildingYearRange', active ? null : yr.value)}
                className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                style={{
                  borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                  background:  active ? 'oklch(42% 0.09 155 / 0.06)' : 'transparent',
                  color:       active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                }}
              >
                {yr.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Amenity badges + sub-inputs */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
          Équipements
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {AMENITIES.map(({ key, label, icon, subInput }) => {
            const active = !!form[key]
            return (
              <div key={key} className={subInput && active ? 'col-span-2' : ''}>
                <button
                  type="button"
                  onClick={() => toggleAmenity(key, subInput)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all text-left ${subInput && active ? 'w-full rounded-b-none border-b-0' : 'w-full'}`}
                  style={{
                    borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                    background:  active ? 'oklch(42% 0.09 155 / 0.06)' : 'transparent',
                  }}
                >
                  <span className="text-xl leading-none">{icon}</span>
                  <span className="text-xs font-medium leading-tight" style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                    {label}
                  </span>
                </button>

                {/* Sub-input: parking spaces */}
                {subInput === 'parkingSpaces' && active && (
                  <div
                    className="flex items-center justify-between px-4 py-2.5 rounded-b-xl border border-t-0"
                    style={{ borderColor: 'var(--color-primary)', background: 'oklch(42% 0.09 155 / 0.04)' }}
                  >
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Nombre de places</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => set('parkingSpaces', Math.max(1, form.parkingSpaces - 1))}
                        disabled={form.parkingSpaces <= 1}
                        className="w-7 h-7 rounded-full border flex items-center justify-center text-base font-medium"
                        style={{ borderColor: 'var(--color-border)', color: form.parkingSpaces <= 1 ? 'var(--color-muted)' : 'var(--color-text)' }}
                      >−</button>
                      <span className="w-5 text-center text-sm font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>{form.parkingSpaces}</span>
                      <button
                        type="button"
                        onClick={() => set('parkingSpaces', Math.min(10, form.parkingSpaces + 1))}
                        className="w-7 h-7 rounded-full border flex items-center justify-center text-base font-medium"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                      >+</button>
                    </div>
                  </div>
                )}

                {/* Sub-input: garden surface */}
                {subInput === 'gardenSurface' && active && (
                  <div
                    className="flex items-center justify-between px-4 py-2.5 rounded-b-xl border border-t-0"
                    style={{ borderColor: 'var(--color-primary)', background: 'oklch(42% 0.09 155 / 0.04)' }}
                  >
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Surface du jardin (m²)</span>
                    <input
                      type="number"
                      min={0}
                      max={5000}
                      value={form.gardenSurface || ''}
                      placeholder="0"
                      onChange={(e) => set('gardenSurface', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 rounded-lg border px-2 py-1 text-sm text-right focus:outline-none focus:ring-1"
                      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
                    />
                  </div>
                )}

                {/* Sub-input: terrace surface */}
                {subInput === 'terraceSurface' && active && (
                  <div
                    className="flex items-center justify-between px-4 py-2.5 rounded-b-xl border border-t-0"
                    style={{ borderColor: 'var(--color-primary)', background: 'oklch(42% 0.09 155 / 0.04)' }}
                  >
                    <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Surface de la terrasse (m²)</span>
                    <input
                      type="number"
                      min={0}
                      max={2000}
                      value={form.terraceSurface || ''}
                      placeholder="0"
                      onChange={(e) => set('terraceSurface', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-20 rounded-lg border px-2 py-1 text-sm text-right focus:outline-none focus:ring-1"
                      style={{ borderColor: 'var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
                    />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
