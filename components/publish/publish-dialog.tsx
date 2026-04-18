'use client'

import { useCallback, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog } from '@/components/ui/dialog'
import { Step1Type } from './step-1-type'
import { Step2Location } from './step-2-location'
import { Step3Details } from './step-3-details'
import { Step4Amenities } from './step-4-amenities'
import { Step5Images } from './step-5-images'
import { Step6Review } from './step-6-review'

// ── Schema ────────────────────────────────────────────────────────────────────

export const wizardSchema = z.object({
  transactionType: z.enum(['sale', 'rent']),
  propertyType:    z.enum(['apartment', 'villa', 'house', 'land', 'commercial', 'office']),
  locationId:      z.string().optional(),
  neighbourhood:   z.string().optional(),
  address:         z.string().min(1, 'Adresse requise'),
  title:           z.string().min(5, 'Titre trop court (5 caractères min.)').max(120),
  price:           z.number().int().positive(),
  surface:         z.number().int().positive().optional(),
  bedrooms:        z.number().int().min(0).optional(),
  bathrooms:       z.number().int().min(0).optional(),
  floor:           z.number().int().min(0).optional(),
  isFurnished:     z.boolean().optional(),
  description:     z.string().optional(),
  amenityIds:      z.array(z.string()).optional(),
  images:          z.array(z.object({
    url:      z.string(),
    position: z.number(),
    isCover:  z.boolean(),
  })).optional(),
})

export type WizardSchema = z.infer<typeof wizardSchema>

// Fields to validate per step
const STEP_FIELDS: Record<number, (keyof WizardSchema)[]> = {
  1: ['transactionType', 'propertyType'],
  2: ['address'],
  3: ['title', 'price'],
  4: [],
  5: [],
}

// ── Step meta ─────────────────────────────────────────────────────────────────

const STEPS = [
  { title: 'Type de bien',      subtitle: 'Que souhaitez-vous faire ?' },
  { title: 'Localisation',      subtitle: 'Où se trouve le bien ?' },
  { title: 'Détails',           subtitle: 'Caractéristiques du bien' },
  { title: 'Équipements',       subtitle: 'Sélectionnez les critères disponibles' },
  { title: 'Photos',            subtitle: 'Ajoutez des photos attractives' },
  { title: 'Vérification',      subtitle: 'Relisez avant de publier' },
]

const TOTAL = STEPS.length

// ── Main component ────────────────────────────────────────────────────────────

export function PublishDialog() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()

  const open = searchParams.get('publish') === 'open'

  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const form = useForm<WizardSchema>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      bedrooms:    1,
      bathrooms:   1,
      floor:       0,
      isFurnished: false,
      amenityIds:  [],
      images:      [],
    },
    mode: 'onChange',
  })

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('publish')
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
    // Reset after close animation
    setTimeout(() => {
      setStep(1)
      form.reset()
    }, 300)
  }, [searchParams, router, pathname, form])

  async function goNext() {
    const fields = STEP_FIELDS[step]
    if (fields && fields.length > 0) {
      const valid = await form.trigger(fields)
      if (!valid) return
    }
    if (step < TOTAL) setStep((s) => s + 1)
  }

  function goPrev() {
    if (step > 1) setStep((s) => s - 1)
  }

  async function handleSaveDraft() {
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 800)) // placeholder
    setSubmitting(false)
    close()
    router.push('/espace-client')
  }

  async function handlePublish() {
    const valid = await form.trigger()
    if (!valid) return
    setSubmitting(true)
    await new Promise((r) => setTimeout(r, 800)) // placeholder
    setSubmitting(false)
    close()
    router.push('/espace-client')
  }

  const meta = STEPS[step - 1]

  return (
    <Dialog open={open} onClose={close} maxWidth="max-w-lg">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 sticky top-0 z-10 rounded-t-3xl" style={{ background: 'var(--color-surface)' }}>
        {/* Progress dots */}
        <div className="flex items-center gap-1.5 mb-4">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full flex-1 transition-all duration-300"
              style={{ background: i < step ? 'var(--color-primary)' : 'var(--color-border)' }}
            />
          ))}
        </div>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--color-muted)' }}>
              Étape {step} sur {TOTAL}
            </p>
            <h2 className="font-display font-semibold text-lg leading-tight" style={{ color: 'var(--color-text)' }}>
              {meta.title}
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {meta.subtitle}
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Fermer"
            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors"
            style={{ color: 'var(--color-muted)' }}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Step content */}
      <div className="px-6 pb-2">
        {step === 1 && <Step1Type form={form} />}
        {step === 2 && <Step2Location form={form} />}
        {step === 3 && <Step3Details form={form} />}
        {step === 4 && <Step4Amenities form={form} />}
        {step === 5 && <Step5Images form={form} />}
        {step === 6 && (
          <Step6Review
            form={form}
            onSaveDraft={handleSaveDraft}
            onPublish={handlePublish}
            isSubmitting={submitting}
          />
        )}
      </div>

      {/* Footer nav — hidden on step 6 (has its own buttons) */}
      {step < 6 && (
        <div className="sticky bottom-0 px-6 pb-6 pt-4 flex items-center justify-between gap-3" style={{ background: 'var(--color-surface)' }}>
          {step > 1 ? (
            <button
              type="button"
              onClick={goPrev}
              className="px-5 py-3 rounded-2xl text-sm font-semibold border transition-colors"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              Précédent
            </button>
          ) : (
            <div />
          )}
          <button
            type="button"
            onClick={goNext}
            className="px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-primary)' }}
          >
            Suivant
          </button>
        </div>
      )}
    </Dialog>
  )
}
