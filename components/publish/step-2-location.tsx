import { type UseFormReturn } from 'react-hook-form'
import type { WizardSchema } from './publish-dialog'
import { CITIES } from '@/data/cities'

interface Props {
  form: UseFormReturn<WizardSchema>
}

function ChevronDown() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
      style={{ color: 'var(--color-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export function Step2Location({ form }: Props) {
  const { register, formState: { errors } } = form

  return (
    <div className="space-y-5">
      {/* City select */}
      <div>
        <label htmlFor="locationId" className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-muted)' }}>
          Ville
        </label>
        <div className="relative">
          <select
            id="locationId"
            {...register('locationId')}
            className="w-full appearance-none rounded-xl border px-4 py-3 pr-9 text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          >
            <option value="">— Choisissez une ville —</option>
            {CITIES.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name} ({city.count} biens)
              </option>
            ))}
          </select>
          <ChevronDown />
        </div>
      </div>

      {/* Neighbourhood / district */}
      <div>
        <label htmlFor="neighbourhood" className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-muted)' }}>
          Quartier / Zone <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>(facultatif)</span>
        </label>
        <input
          id="neighbourhood"
          type="text"
          placeholder="Ex : El Menzah, Cité El Ghazala, Centre-ville…"
          {...register('neighbourhood' as keyof WizardSchema)}
          className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
        />
      </div>

      {/* Address */}
      <div>
        <label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-muted)' }}>
          Adresse précise
        </label>
        <input
          id="address"
          type="text"
          placeholder="Ex : 12 Rue Ibn Khaldoun"
          {...register('address')}
          className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
          style={{
            borderColor: errors.address ? 'oklch(55% 0.18 25)' : 'var(--color-border)',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
          }}
        />
        {errors.address && (
          <p className="text-xs mt-1.5" style={{ color: 'oklch(55% 0.18 25)' }}>{errors.address.message}</p>
        )}
      </div>

      {/* Info */}
      <p className="text-xs leading-relaxed rounded-xl p-3.5" style={{ background: 'oklch(42% 0.09 155 / 0.06)', color: 'var(--color-primary)' }}>
        La localisation précise est visible uniquement après contact. Seule la ville est affichée publiquement.
      </p>
    </div>
  )
}
