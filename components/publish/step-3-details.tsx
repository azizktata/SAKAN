import { type UseFormReturn } from 'react-hook-form'
import type { WizardSchema } from './publish-dialog'

interface Props {
  form: UseFormReturn<WizardSchema>
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--color-muted)' }}>
      {children}
    </p>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs mt-1.5" style={{ color: 'oklch(55% 0.18 25)' }}>{message}</p>
}

const inputCls = 'w-full border-2 px-4 py-3 text-sm focus:outline-none focus:ring-2'
const inputStyle = (hasError?: boolean): React.CSSProperties => ({
  borderRadius: '3px',
  borderColor: hasError ? 'oklch(55% 0.18 25)' : 'var(--color-border)',
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
})

function Stepper({ label, value, onChange, min = 0 }: {
  label: string; value: number; onChange: (n: number) => void; min?: number
}) {
  return (
    <div className="flex items-center justify-between py-3.5 px-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 flex items-center justify-center text-sm font-bold border-2 transition-colors disabled:opacity-30"
          style={{ borderRadius: '3px', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
        >
          −
        </button>
        <span className="w-8 text-center font-display font-bold tabular-nums text-sm" style={{ color: 'var(--color-text)' }}>
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 flex items-center justify-center text-sm font-bold border-2 transition-colors"
          style={{ borderRadius: '3px', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
        >
          +
        </button>
      </div>
    </div>
  )
}

export function Step3Details({ form }: Props) {
  const { register, setValue, watch, formState: { errors } } = form
  const bedrooms  = watch('bedrooms')  ?? 1
  const bathrooms = watch('bathrooms') ?? 1
  const floor     = watch('floor')     ?? 0

  return (
    <div className="space-y-5">
      {/* Title */}
      <div>
        <FieldLabel>Titre de l&apos;annonce</FieldLabel>
        <input
          id="title"
          type="text"
          placeholder="Ex : Appartement lumineux au cœur de Tunis"
          {...register('title')}
          className={inputCls}
          style={inputStyle(!!errors.title)}
        />
        <FieldError message={errors.title?.message} />
      </div>

      {/* Price + Surface */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Prix (DT)</FieldLabel>
          <input
            id="price"
            type="number"
            min={0}
            placeholder="Ex : 280 000"
            {...register('price', { setValueAs: (v: string) => v === '' ? undefined : parseInt(v, 10) })}
            className={inputCls}
            style={inputStyle(!!errors.price)}
          />
          <FieldError message={errors.price?.message} />
        </div>
        <div>
          <FieldLabel>Surface (m²)</FieldLabel>
          <input
            id="surface"
            type="number"
            min={1}
            placeholder="Ex : 95"
            {...register('surface', { setValueAs: (v: string) => v === '' ? undefined : parseInt(v, 10) })}
            className={inputCls}
            style={inputStyle()}
          />
        </div>
      </div>

      {/* Steppers */}
      <div>
        <FieldLabel>Pièces</FieldLabel>
        <div className="overflow-hidden border-2" style={{ borderRadius: '3px', borderColor: 'var(--color-border)' }}>
          <Stepper label="Chambres"      value={bedrooms}  onChange={(n) => setValue('bedrooms',  n)} min={0} />
          <Stepper label="Salles de bain" value={bathrooms} onChange={(n) => setValue('bathrooms', n)} min={0} />
          <div className="flex items-center justify-between py-3.5 px-4">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Étage</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setValue('floor', Math.max(0, floor - 1))}
                disabled={floor <= 0}
                className="w-8 h-8 flex items-center justify-center text-sm font-bold border-2 transition-colors disabled:opacity-30"
                style={{ borderRadius: '3px', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
              >
                −
              </button>
              <span className="w-8 text-center font-display font-bold tabular-nums text-sm" style={{ color: 'var(--color-text)' }}>
                {floor}
              </span>
              <button
                type="button"
                onClick={() => setValue('floor', floor + 1)}
                className="w-8 h-8 flex items-center justify-center text-sm font-bold border-2 transition-colors"
                style={{ borderRadius: '3px', borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div>
        <FieldLabel>
          Description{' '}
          <span style={{ color: 'var(--color-muted)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(facultatif)</span>
        </FieldLabel>
        <textarea
          id="description"
          rows={3}
          placeholder="Décrivez votre bien, ses atouts, l'environnement…"
          {...register('description')}
          className="w-full border-2 px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
          style={inputStyle()}
        />
      </div>
    </div>
  )
}
