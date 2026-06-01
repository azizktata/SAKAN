import type { EstFormData } from './estimation-dialog'
import type { TransactionType, PropertyType } from '@/lib/estimation-engine'

const TRANSACTION_TYPES: { value: TransactionType; label: string; desc: string }[] = [
  { value: 'vente',    label: 'Vente',    desc: 'Estimer le prix de vente' },
  { value: 'location', label: 'Location', desc: 'Estimer le loyer mensuel' },
]

const PROPERTY_TYPES: { value: PropertyType; label: string; icon: string }[] = [
  { value: 'apartment',  label: 'Appartement', icon: '🏢' },
  { value: 'villa',      label: 'Villa',       icon: '🏡' },
  { value: 'house',      label: 'Maison',      icon: '🏠' },
  { value: 'land',       label: 'Terrain',     icon: '🌿' },
  { value: 'commercial', label: 'Commercial',  icon: '🏪' },
  { value: 'office',     label: 'Bureau',      icon: '💼' },
]

interface Props {
  form: EstFormData
  setForm: (f: EstFormData) => void
}

export function EstStep1Type({ form, setForm }: Props) {
  return (
    <div className="space-y-6">
      {/* Transaction type */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
          Type de transaction
        </p>
        <div className="grid grid-cols-2 gap-3">
          {TRANSACTION_TYPES.map((t) => {
            const active = form.transactionType === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm({ ...form, transactionType: t.value })}
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
      </div>

      {/* Property type */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
          Type de bien
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {PROPERTY_TYPES.map((t) => {
            const active = form.propertyType === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setForm({ ...form, propertyType: t.value })}
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
      </div>
    </div>
  )
}
