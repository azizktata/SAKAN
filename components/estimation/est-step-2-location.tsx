import type { EstFormData } from './estimation-dialog'

const CITIES = [
  { slug: 'tunis',    name: 'Tunis' },
  { slug: 'la-marsa', name: 'La Marsa' },
  { slug: 'ariana',   name: 'Ariana' },
  { slug: 'sousse',   name: 'Sousse' },
  { slug: 'sfax',     name: 'Sfax' },
  { slug: 'hammamet', name: 'Hammamet' },
  { slug: 'monastir', name: 'Monastir' },
  { slug: 'nabeul',   name: 'Nabeul' },
  { slug: 'bizerte',  name: 'Bizerte' },
  { slug: 'gabes',    name: 'Gabès' },
  { slug: 'ben-arous',name: 'Ben Arous' },
  { slug: 'manouba',  name: 'Manouba' },
  { slug: 'kairouan', name: 'Kairouan' },
  { slug: 'djerba',   name: 'Djerba' },
  { slug: 'mahdia',   name: 'Mahdia' },
]

function ChevronDown() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
      style={{ color: 'var(--color-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

interface Props {
  form: EstFormData
  setForm: (f: EstFormData) => void
}

export function EstStep2Location({ form, setForm }: Props) {
  return (
    <div className="space-y-5">
      {/* City select */}
      <div>
        <label htmlFor="est-city" className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-muted)' }}>
          Ville
        </label>
        <div className="relative">
          <select
            id="est-city"
            value={form.citySlug}
            onChange={(e) => setForm({ ...form, citySlug: e.target.value })}
            className="w-full appearance-none rounded-xl border px-4 py-3 pr-9 text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          >
            {CITIES.map((c) => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
            <option value="_default">Autre ville</option>
          </select>
          <ChevronDown />
        </div>
      </div>

      {/* Address */}
      <div>
        <label htmlFor="est-address" className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-muted)' }}>
          Adresse précise
        </label>
        <input
          id="est-address"
          type="text"
          placeholder="Ex : 12 Rue Ibn Khaldoun"
          value={form.address ?? ''}
          onChange={(e) => setForm({ ...form, address: e.target.value })}
          className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
        />
      </div>

      {/* Info box */}
      <p className="text-xs leading-relaxed rounded-xl p-3.5" style={{ background: 'oklch(42% 0.09 155 / 0.06)', color: 'var(--color-primary)' }}>
        Les prix de référence sont basés sur les données du marché tunisien 2024–2025. L&apos;estimation est indicative et peut varier selon le quartier précis.
      </p>
    </div>
  )
}
