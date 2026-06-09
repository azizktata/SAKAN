import type { EstFormData, BuildingYearRange } from './estimation-dialog'
import type { Condition } from '@/lib/estimation-engine'

// ── Icon library (monochrome SVG line icons) ──────────────────────────────────

function IconFurnished() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  )
}

function IconParking() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  )
}

function IconElevator() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
    </svg>
  )
}

function IconGarden() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  )
}

function IconPool() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75a1.5 1.5 0 00-3 0v9a4.5 4.5 0 009 0V3.75a1.5 1.5 0 00-3 0v9a1.5 1.5 0 01-3 0v-9zm3 15.75h.008v.008H10.5v-.008zm3 0h.008v.008H13.5v-.008zm3 0h.008v.008H16.5v-.008z" />
    </svg>
  )
}

function IconTerrace() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
    </svg>
  )
}

function IconBalcony() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m3-3H15m-1.5 3H15" />
    </svg>
  )
}

function IconSecurity() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

function IconAC() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m4.5-4.5l-4.5 4.5-4.5-4.5M12 3L7.5 7.5 12 3l4.5 4.5M3 12h18m-4.5 4.5L21 12l-4.5-4.5M3 12l4.5-4.5L3 12l4.5 4.5" />
    </svg>
  )
}

function IconHeating() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const CONDITIONS: { value: Condition; label: string; desc: string; Icon: React.FC }[] = [
  {
    value: 'neuf',
    label: 'Neuf / récent',
    desc: '< 5 ans ou entièrement rénové',
    Icon: () => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
  },
  {
    value: 'bon_etat',
    label: 'Bon état',
    desc: 'Entretenu, sans travaux',
    Icon: () => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    value: 'a_renover',
    label: 'À rénover',
    desc: 'Travaux importants',
    Icon: () => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
]

const YEAR_RANGES: { value: BuildingYearRange; label: string }[] = [
  { value: '2020+',      label: '2020+' },
  { value: '2010-2019',  label: '2010–2019' },
  { value: '2000-2009',  label: '2000–2009' },
  { value: '1990-1999',  label: '1990–1999' },
  { value: '1980-1989',  label: '1980–1989' },
  { value: 'avant-1980', label: 'Avant 1980' },
]

type AmenityKey = keyof Pick<EstFormData,
  'isFurnished' | 'hasParking' | 'hasElevator' | 'hasGarden' | 'hasPool' |
  'hasTerrace' | 'hasBalcony' | 'hasSecurity' | 'hasAirConditioning' | 'hasHeating'
>

type AmenityDef = {
  key: AmenityKey; label: string; Icon: React.FC
  subInput?: 'parkingSpaces' | 'gardenSurface' | 'terraceSurface'
}

const AMENITIES: AmenityDef[] = [
  { key: 'isFurnished',        label: 'Meublé',       Icon: IconFurnished },
  { key: 'hasParking',         label: 'Parking',       Icon: IconParking,  subInput: 'parkingSpaces'  },
  { key: 'hasElevator',        label: 'Ascenseur',     Icon: IconElevator  },
  { key: 'hasGarden',          label: 'Jardin',        Icon: IconGarden,   subInput: 'gardenSurface'  },
  { key: 'hasPool',            label: 'Piscine',       Icon: IconPool      },
  { key: 'hasTerrace',         label: 'Terrasse',      Icon: IconTerrace,  subInput: 'terraceSurface' },
  { key: 'hasBalcony',         label: 'Balcon',        Icon: IconBalcony   },
  { key: 'hasSecurity',        label: 'Sécurité',      Icon: IconSecurity  },
  { key: 'hasAirConditioning', label: 'Climatisation', Icon: IconAC        },
  { key: 'hasHeating',         label: 'Chauffage',     Icon: IconHeating   },
]

// ── Stepper ───────────────────────────────────────────────────────────────────

function Stepper({ label, value, onChange, min = 0 }: {
  label: string; value: number; onChange: (n: number) => void; min?: number
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5"
      style={{ borderBottom: '1px solid var(--color-border)' }}>
      <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
          className="w-8 h-8 rounded-lg border-2 flex items-center justify-center text-base font-semibold transition-all"
          style={{ borderColor: value <= min ? 'var(--color-border)' : 'var(--color-primary)', color: value <= min ? 'var(--color-muted)' : 'var(--color-primary)' }}>
          −
        </button>
        <span className="w-7 text-center font-display font-bold text-base tabular-nums" style={{ color: 'var(--color-text)' }}>
          {value}
        </span>
        <button type="button" onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-lg border-2 flex items-center justify-center text-base font-semibold transition-all"
          style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
          +
        </button>
      </div>
    </div>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

interface Props { form: EstFormData; setForm: (f: EstFormData) => void }

export function EstStep2Details({ form, setForm }: Props) {
  function set<K extends keyof EstFormData>(key: K, value: EstFormData[K]) {
    setForm({ ...form, [key]: value })
  }

  function toggleAmenity(key: AmenityKey, subInput?: AmenityDef['subInput']) {
    const next = !form[key]
    const patch: Partial<EstFormData> = { [key]: next }
    if (!next && subInput) {
      if (subInput === 'parkingSpaces')  patch.parkingSpaces  = 1
      if (subInput === 'gardenSurface')  patch.gardenSurface  = 0
      if (subInput === 'terraceSurface') patch.terraceSurface = 0
    }
    setForm({ ...form, ...patch })
  }

  return (
    <div className="space-y-6">

      {/* Surface */}
      <div>
        <label htmlFor="est-surface" className="text-xs font-bold uppercase tracking-widest block mb-2"
          style={{ color: 'var(--color-muted)' }}>
          Surface (m²)
        </label>
        <div className="relative">
          <input id="est-surface" type="number" min={1} value={form.surface}
            onChange={e => set('surface', Math.max(1, parseInt(e.target.value) || 1))}
            className="w-full py-3.5 pr-14 text-sm font-semibold focus:outline-none focus:ring-2 transition-colors"
            style={{ borderRadius: '3px', border: '2px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', paddingLeft: '14px' }}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold pointer-events-none"
            style={{ color: 'var(--color-muted)' }}>m²</span>
        </div>
      </div>

      {/* Steppers */}
      <div style={{ borderRadius: '3px', border: '2px solid var(--color-border)', background: 'var(--color-surface)', overflow: 'hidden' }}>
        <Stepper label="Chambres"       value={form.bedrooms}  onChange={n => set('bedrooms', n)}  min={0} />
        <Stepper label="Salles de bain" value={form.bathrooms} onChange={n => set('bathrooms', n)} min={0} />
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>Étage</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => set('floor', Math.max(0, form.floor - 1))} disabled={form.floor <= 0}
              className="w-8 h-8 rounded-lg border-2 flex items-center justify-center text-base font-semibold"
              style={{ borderColor: form.floor <= 0 ? 'var(--color-border)' : 'var(--color-primary)', color: form.floor <= 0 ? 'var(--color-muted)' : 'var(--color-primary)' }}>
              −
            </button>
            <span className="w-7 text-center font-display font-bold text-base tabular-nums" style={{ color: 'var(--color-text)' }}>{form.floor}</span>
            <button type="button" onClick={() => set('floor', form.floor + 1)}
              className="w-8 h-8 rounded-lg border-2 flex items-center justify-center text-base font-semibold"
              style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
              +
            </button>
          </div>
        </div>
      </div>

      {/* Condition */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
          État du bien
        </p>
        <div className="grid grid-cols-3 gap-2">
          {CONDITIONS.map(({ value, label, desc, Icon }) => {
            const active = form.condition === value
            return (
              <button key={value} type="button" onClick={() => set('condition', value)}
                className="flex flex-col items-center gap-2 py-4 px-2 text-center transition-all duration-150"
                style={{
                  borderRadius: '3px',
                  border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: active ? 'var(--color-primary)' : 'var(--color-surface)',
                }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: active ? 'oklch(100% 0 0 / 0.12)' : 'var(--color-surface-warm)', color: active ? 'white' : 'var(--color-primary)' }}>
                  <Icon />
                </div>
                <span className="text-xs font-bold leading-tight" style={{ color: active ? 'white' : 'var(--color-text)' }}>{label}</span>
                <span className="text-[10px] leading-tight" style={{ color: active ? 'oklch(82% 0.012 70)' : 'var(--color-muted)' }}>{desc}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Year */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
          Année de construction{' '}
          <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 400 }}>— optionnel</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {YEAR_RANGES.map(({ value, label }) => {
            const active = form.buildingYearRange === value
            return (
              <button key={value} type="button" onClick={() => set('buildingYearRange', active ? null : value)}
                className="px-3.5 py-2 text-xs font-bold border-2 transition-all"
                style={{
                  borderRadius: '3px',
                  borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                  background:  active ? 'var(--color-primary)' : 'transparent',
                  color:       active ? 'white' : 'var(--color-text-secondary)',
                }}>
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Amenities */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
          Équipements
        </p>
        <div className="grid grid-cols-2 gap-2">
          {AMENITIES.map(({ key, label, Icon, subInput }) => {
            const active = !!form[key]
            return (
              <div key={key} className={subInput && active ? 'col-span-2' : ''}>
                <button type="button" onClick={() => toggleAmenity(key, subInput)}
                  className="flex items-center gap-2.5 px-3.5 py-3 text-left transition-all duration-150 w-full"
                  style={{
                    borderRadius: subInput && active ? '3px 3px 0 0' : '3px',
                    border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderBottom: subInput && active ? 'none' : undefined,
                    background: active ? 'oklch(32% 0.08 130 / 0.06)' : 'var(--color-surface)',
                  }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: active ? 'oklch(32% 0.08 130 / 0.12)' : 'var(--color-surface-warm)', color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                    <Icon />
                  </div>
                  <span className="text-xs font-semibold leading-tight flex-1"
                    style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                    {label}
                  </span>
                  {active && (
                    <span style={{ color: 'var(--color-primary)' }}><IconCheck /></span>
                  )}
                </button>

                {/* Sub: parking */}
                {subInput === 'parkingSpaces' && active && (
                  <div className="flex items-center justify-between px-4 py-2.5"
                    style={{ borderRadius: '0 0 3px 3px', border: '2px solid var(--color-primary)', borderTop: 'none', background: 'oklch(32% 0.08 130 / 0.04)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>Nombre de places</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => set('parkingSpaces', Math.max(1, form.parkingSpaces - 1))} disabled={form.parkingSpaces <= 1}
                        className="w-7 h-7 rounded-md border-2 flex items-center justify-center text-sm font-bold"
                        style={{ borderColor: form.parkingSpaces <= 1 ? 'var(--color-border)' : 'var(--color-primary)', color: form.parkingSpaces <= 1 ? 'var(--color-muted)' : 'var(--color-primary)' }}>
                        −
                      </button>
                      <span className="w-5 text-center text-sm font-bold tabular-nums" style={{ color: 'var(--color-primary)' }}>{form.parkingSpaces}</span>
                      <button type="button" onClick={() => set('parkingSpaces', Math.min(10, form.parkingSpaces + 1))}
                        className="w-7 h-7 rounded-md border-2 flex items-center justify-center text-sm font-bold"
                        style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                        +
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub: garden */}
                {subInput === 'gardenSurface' && active && (
                  <div className="flex items-center justify-between px-4 py-2.5"
                    style={{ borderRadius: '0 0 3px 3px', border: '2px solid var(--color-primary)', borderTop: 'none', background: 'oklch(32% 0.08 130 / 0.04)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>Surface du jardin</span>
                    <div className="flex items-center gap-1.5">
                      <input type="number" min={0} max={5000} value={form.gardenSurface || ''} placeholder="0"
                        onChange={e => set('gardenSurface', Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-20 rounded border-2 px-2 py-1 text-sm text-right font-bold focus:outline-none"
                        style={{ borderColor: 'var(--color-primary)', background: 'var(--color-surface)', color: 'var(--color-primary)' }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>m²</span>
                    </div>
                  </div>
                )}

                {/* Sub: terrace */}
                {subInput === 'terraceSurface' && active && (
                  <div className="flex items-center justify-between px-4 py-2.5"
                    style={{ borderRadius: '0 0 3px 3px', border: '2px solid var(--color-primary)', borderTop: 'none', background: 'oklch(32% 0.08 130 / 0.04)' }}>
                    <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>Surface de la terrasse</span>
                    <div className="flex items-center gap-1.5">
                      <input type="number" min={0} max={2000} value={form.terraceSurface || ''} placeholder="0"
                        onChange={e => set('terraceSurface', Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-20 rounded border-2 px-2 py-1 text-sm text-right font-bold focus:outline-none"
                        style={{ borderColor: 'var(--color-primary)', background: 'var(--color-surface)', color: 'var(--color-primary)' }} />
                      <span className="text-xs font-semibold" style={{ color: 'var(--color-primary)' }}>m²</span>
                    </div>
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
