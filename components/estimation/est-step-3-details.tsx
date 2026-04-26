import type { EstFormData } from './estimation-dialog'
import type { Condition } from '@/lib/estimation-engine'

const CONDITIONS: { value: Condition; label: string; desc: string }[] = [
  { value: 'neuf',      label: 'Neuf / récent',  desc: '< 5 ans ou entièrement rénové' },
  { value: 'bon_etat',  label: 'Bon état',        desc: 'Entretenu, sans travaux' },
  { value: 'a_renover', label: 'À rénover',       desc: 'Travaux importants nécessaires' },
]

const AMENITIES: { key: keyof Pick<EstFormData, 'isFurnished' | 'hasParking' | 'hasElevator' | 'hasGarden' | 'hasPool'>; label: string; icon: string }[] = [
  { key: 'isFurnished', label: 'Meublé',    icon: '🛋️' },
  { key: 'hasParking',  label: 'Parking',   icon: '🚗' },
  { key: 'hasElevator', label: 'Ascenseur', icon: '🛗' },
  { key: 'hasGarden',   label: 'Jardin',    icon: '🌿' },
  { key: 'hasPool',     label: 'Piscine',   icon: '🏊' },
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

      {/* Amenity badges */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
          Équipements
        </p>
        <div className="grid grid-cols-2 gap-2.5">
          {AMENITIES.map(({ key, label, icon }) => {
            const active = !!form[key]
            return (
              <button
                key={key}
                type="button"
                onClick={() => set(key, !form[key])}
                className="flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all text-left"
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
            )
          })}
        </div>
      </div>
    </div>
  )
}
