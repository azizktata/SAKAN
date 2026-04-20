import { type UseFormReturn } from 'react-hook-form'
import type { WizardSchema } from './publish-dialog'
import type { Amenity } from '@/lib/api'

interface Props {
  form: UseFormReturn<WizardSchema>
  amenities: Amenity[]
}

export function Step4Amenities({ form, amenities }: Props) {
  const { setValue, watch } = form
  const amenityIds = watch('amenityIds') ?? []

  function toggle(id: string) {
    const next = amenityIds.includes(id)
      ? amenityIds.filter((a) => a !== id)
      : [...amenityIds, id]
    setValue('amenityIds', next)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Sélectionnez les équipements et critères disponibles pour ce bien.
      </p>
      {amenities.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Chargement des équipements…</p>
      ) : (
      <div className="grid grid-cols-2 gap-2.5">
        {amenities.map((a) => {
          const id = String(a.id)
          const active = amenityIds.includes(id)
          return (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all text-left"
              style={{
                borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                background:  active ? 'oklch(42% 0.09 155 / 0.06)' : 'transparent',
              }}
            >
              <span className="text-xs font-medium leading-tight" style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                {a.name}
              </span>
            </button>
          )
        })}
      </div>
      )}
      {amenityIds.length > 0 && (
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          {amenityIds.length} équipement{amenityIds.length > 1 ? 's' : ''} sélectionné{amenityIds.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
