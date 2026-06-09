import { type UseFormReturn } from 'react-hook-form'
import type { WizardSchema } from './publish-dialog'
import type { Amenity } from '@/lib/api'

interface Props {
  form: UseFormReturn<WizardSchema>
  amenities: Amenity[]
}

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
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
        <div className="flex items-center gap-2 py-6 justify-center">
          <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>Chargement…</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {amenities.map((a) => {
            const id     = String(a.id)
            const active = amenityIds.includes(id)
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                className="flex items-center gap-2.5 px-3.5 py-3 border-2 transition-all text-left"
                style={{
                  borderRadius: '3px',
                  borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                  background:  active ? 'oklch(42% 0.09 155 / 0.06)' : 'var(--color-surface)',
                }}
              >
                <div
                  className="w-5 h-5 shrink-0 flex items-center justify-center border-2 transition-all"
                  style={{
                    borderRadius: '3px',
                    borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                    background:  active ? 'var(--color-primary)' : 'transparent',
                    color: 'white',
                  }}
                >
                  {active && <CheckIcon />}
                </div>
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
