import type { UseFormReturn } from 'react-hook-form'
import type { WizardSchema } from './publish-dialog'

const TRANSACTION_TYPES = [
  { value: 'sale',     label: 'Vente',    desc: 'Vendre votre bien' },
  { value: 'rent',     label: 'Location', desc: 'Mettre en location' },
] as const

const PROPERTY_TYPES = [
  { value: 'apartment',  label: 'Appartement', icon: '🏢' },
  { value: 'villa',      label: 'Villa',       icon: '🏡' },
  { value: 'house',      label: 'Maison',      icon: '🏠' },
  { value: 'land',       label: 'Terrain',     icon: '🌿' },
  { value: 'commercial', label: 'Commercial',  icon: '🏪' },
  { value: 'office',     label: 'Bureau',      icon: '💼' },
] as const

interface Props {
  form: UseFormReturn<WizardSchema>
}

export function Step1Type({ form }: Props) {
  const { watch, setValue, formState: { errors } } = form
  const transactionType = watch('transactionType')
  const propertyType    = watch('propertyType')

  return (
    <div className="space-y-6">
      {/* Transaction type */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
          Type de transaction
        </p>
        <div className="grid grid-cols-2 gap-3">
          {TRANSACTION_TYPES.map((t) => {
            const active = transactionType === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setValue('transactionType', t.value, { shouldValidate: true })}
                className="rounded-2xl p-4 text-left transition-all duration-150 border-2"
                style={{
                  borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                  background:  active ? 'oklch(42% 0.09 155 / 0.06)' : 'var(--color-bg)',
                }}
              >
                <p className="font-display font-semibold text-sm" style={{ color: active ? 'var(--color-primary)' : 'var(--color-text)' }}>
                  {t.label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{t.desc}</p>
              </button>
            )
          })}
        </div>
        {errors.transactionType && (
          <p className="text-xs mt-1.5" style={{ color: 'oklch(55% 0.18 25)' }}>{errors.transactionType.message}</p>
        )}
      </div>

      {/* Property type */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
          Type de bien
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {PROPERTY_TYPES.map((t) => {
            const active = propertyType === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setValue('propertyType', t.value, { shouldValidate: true })}
                className="rounded-2xl p-3.5 flex flex-col items-center gap-2 transition-all duration-150 border-2"
                style={{
                  borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                  background:  active ? 'oklch(42% 0.09 155 / 0.06)' : 'var(--color-bg)',
                }}
              >
                <span className="text-2xl leading-none">{t.icon}</span>
                <span className="text-xs font-medium" style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                  {t.label}
                </span>
              </button>
            )
          })}
        </div>
        {errors.propertyType && (
          <p className="text-xs mt-1.5" style={{ color: 'oklch(55% 0.18 25)' }}>{errors.propertyType.message}</p>
        )}
      </div>
    </div>
  )
}
