import { type UseFormReturn, Controller } from 'react-hook-form'
import type { WizardSchema } from './publish-dialog'
import type { Location } from '@/lib/api'

interface Props {
  form: UseFormReturn<WizardSchema>
  locations: Location[]
}

function ChevronDown() {
  return (
    <svg aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4"
      style={{ color: 'var(--color-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

export function Step2Location({ form, locations }: Props) {
  const { register, control, formState: { errors } } = form

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
            {locations.map((loc) => (
              <option key={loc.id} value={String(loc.id)}>
                {loc.name}
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

      {/* Coordinates */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-muted)' }}>
          Coordonnées GPS <span style={{ fontWeight: 400 }}>(facultatif)</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Controller
              name="latitude"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  step="any"
                  placeholder="Latitude  ex: 36.8065"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: errors.latitude ? 'oklch(55% 0.18 25)' : 'var(--color-border)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  }}
                />
              )}
            />
            {errors.latitude && (
              <p className="text-xs mt-1" style={{ color: 'oklch(55% 0.18 25)' }}>{errors.latitude.message}</p>
            )}
          </div>
          <div>
            <Controller
              name="longitude"
              control={control}
              render={({ field }) => (
                <input
                  type="number"
                  step="any"
                  placeholder="Longitude  ex: 10.1815"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                  className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  style={{
                    borderColor: errors.longitude ? 'oklch(55% 0.18 25)' : 'var(--color-border)',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)',
                  }}
                />
              )}
            />
            {errors.longitude && (
              <p className="text-xs mt-1" style={{ color: 'oklch(55% 0.18 25)' }}>{errors.longitude.message}</p>
            )}
          </div>
        </div>
        <p className="text-xs mt-2" style={{ color: 'var(--color-muted)' }}>
          Trouvez les coordonnées sur <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>Google Maps</a> en faisant un clic droit sur l'emplacement.
        </p>
      </div>

      {/* Info */}
      <p className="text-xs leading-relaxed rounded-xl p-3.5" style={{ background: 'oklch(42% 0.09 155 / 0.06)', color: 'var(--color-primary)' }}>
        La localisation précise est visible uniquement après contact. Seule la ville est affichée publiquement.
      </p>
    </div>
  )
}
