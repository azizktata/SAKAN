import { type UseFormReturn } from 'react-hook-form'
import type { WizardSchema } from './publish-dialog'

interface Props {
  form: UseFormReturn<WizardSchema>
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs mt-1.5" style={{ color: 'oklch(55% 0.18 25)' }}>{message}</p>
}

function Stepper({ label, value, onChange, min = 0 }: { label: string; value: number; onChange: (n: number) => void; min?: number }) {
  return (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="w-8 h-8 rounded-full border flex items-center justify-center text-lg font-medium transition-colors"
          style={{
            borderColor: 'var(--color-border)',
            color: value <= min ? 'var(--color-muted)' : 'var(--color-text)',
          }}
        >
          −
        </button>
        <span className="w-6 text-center font-display font-semibold tabular-nums" style={{ color: 'var(--color-text)' }}>
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="w-8 h-8 rounded-full border flex items-center justify-center text-lg font-medium transition-colors"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
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
        <label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-muted)' }}>
          Titre de l'annonce
        </label>
        <input
          id="title"
          type="text"
          placeholder="Ex : Appartement lumineux au cœur de Tunis"
          {...register('title')}
          className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
          style={{ borderColor: errors.title ? 'oklch(55% 0.18 25)' : 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
        />
        <FieldError message={errors.title?.message} />
      </div>

      {/* Price + Surface */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="price" className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-muted)' }}>
            Prix (DT)
          </label>
          <input
            id="price"
            type="number"
            min={0}
            placeholder="Ex : 280 000"
            {...register('price', { setValueAs: (v: string) => v === '' ? undefined : parseInt(v, 10) })}
            className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: errors.price ? 'oklch(55% 0.18 25)' : 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          />
          <FieldError message={errors.price?.message} />
        </div>
        <div>
          <label htmlFor="surface" className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-muted)' }}>
            Surface (m²)
          </label>
          <input
            id="surface"
            type="number"
            min={1}
            placeholder="Ex : 95"
            {...register('surface', { setValueAs: (v: string) => v === '' ? undefined : parseInt(v, 10) })}
            className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          />
        </div>
      </div>

      {/* Steppers */}
      <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        <div className="px-4">
          <Stepper label="Chambres"    value={bedrooms}  onChange={(n) => setValue('bedrooms',  n)} min={0} />
          <Stepper label="Salles de bain" value={bathrooms} onChange={(n) => setValue('bathrooms', n)} min={0} />
          <Stepper label="Étage"       value={floor}     onChange={(n) => setValue('floor',     n)} min={0} />
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-muted)' }}>
          Description <span style={{ color: 'var(--color-muted)', fontWeight: 400 }}>(facultatif)</span>
        </label>
        <textarea
          id="description"
          rows={3}
          placeholder="Décrivez votre bien, ses atouts, l'environnement…"
          {...register('description')}
          className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none"
          style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
        />
      </div>
    </div>
  )
}
