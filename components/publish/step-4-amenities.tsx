import { type UseFormReturn } from 'react-hook-form'
import type { WizardSchema } from './publish-dialog'

const AMENITIES = [
  { slug: 'ascenseur',      label: 'Ascenseur',        icon: '🛗' },
  { slug: 'garage',         label: 'Garage',           icon: '🚗' },
  { slug: 'terrasse',       label: 'Terrasse',         icon: '🌇' },
  { slug: 'jardin',         label: 'Jardin',           icon: '🌳' },
  { slug: 'meuble',         label: 'Meublé',           icon: '🛋️' },
  { slug: 'piscine',        label: 'Piscine',          icon: '🏊' },
  { slug: 'gardien',        label: 'Gardien',          icon: '👮' },
  { slug: 'proche-mosquee', label: 'Proche mosquée',   icon: '🕌' },
  { slug: 'ecole',          label: 'École à proximité',icon: '🏫' },
  { slug: 'transports',     label: 'Transports',       icon: '🚌' },
  { slug: 'climatisation',  label: 'Climatisation',    icon: '❄️' },
  { slug: 'securite',       label: 'Sécurité 24h',     icon: '🔒' },
] as const

interface Props {
  form: UseFormReturn<WizardSchema>
}

export function Step4Amenities({ form }: Props) {
  const { setValue, watch } = form
  const amenityIds = watch('amenityIds') ?? []

  function toggle(slug: string) {
    const next = amenityIds.includes(slug)
      ? amenityIds.filter((a) => a !== slug)
      : [...amenityIds, slug]
    setValue('amenityIds', next)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Sélectionnez les équipements et critères disponibles pour ce bien.
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {AMENITIES.map((a) => {
          const active = amenityIds.includes(a.slug)
          return (
            <button
              key={a.slug}
              type="button"
              onClick={() => toggle(a.slug)}
              className="flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all text-left"
              style={{
                borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                background:  active ? 'oklch(42% 0.09 155 / 0.06)' : 'transparent',
              }}
            >
              <span className="text-xl leading-none">{a.icon}</span>
              <span className="text-xs font-medium leading-tight" style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                {a.label}
              </span>
            </button>
          )
        })}
      </div>
      {amenityIds.length > 0 && (
        <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
          {amenityIds.length} équipement{amenityIds.length > 1 ? 's' : ''} sélectionné{amenityIds.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
