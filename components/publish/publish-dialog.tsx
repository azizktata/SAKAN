'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog } from '@/components/ui/dialog'
import { useAuth } from '@/lib/auth-context'
import { propertiesApi, uploadApi, referenceApi, type Location, type Amenity, type Property } from '@/lib/api'
import { Step0Auth } from './step-0-auth'
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
  latitude:        z.number().min(-90).max(90).optional(),
  longitude:       z.number().min(-180).max(180).optional(),
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

const STEP_FIELDS: Record<number, (keyof WizardSchema)[]> = {
  1: ['transactionType', 'propertyType'],
  2: ['address'],
  3: ['title', 'price'],
  4: [],
  5: [],
}

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
  const { user, loading: authLoading } = useAuth()

  const open   = searchParams.get('publish') === 'open'
  const editId = searchParams.get('edit') ?? undefined

  const [step, setStep]             = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(false)
  const [locations, setLocations]   = useState<Location[]>([])
  const [amenities, setAmenities]   = useState<Amenity[]>([])

  useEffect(() => {
    if (!open) return
    referenceApi.locations().then((r) => setLocations(r.data)).catch(() => {})
    referenceApi.amenities().then((r) => setAmenities(r.data)).catch(() => {})
  }, [open])

  useEffect(() => {
    if (!open || !editId) return
    setLoadingEdit(true)
    propertiesApi.get(editId)
      .then((res) => {
        const p: Property = res.data
        form.reset({
          transactionType: p.transaction_type,
          propertyType:    p.property_type as WizardSchema['propertyType'],
          locationId:      p.location_id ? String(p.location_id) : undefined,
          address:         p.address ?? '',
          latitude:        p.latitude,
          longitude:       p.longitude,
          title:           p.title,
          price:           p.price,
          surface:         p.surface,
          bedrooms:        p.bedrooms,
          bathrooms:       p.bathrooms,
          floor:           p.floor,
          isFurnished:     p.is_furnished,
          description:     p.description,
          amenityIds:      p.amenities?.map((a) => String(a.id)) ?? [],
          images:          p.images?.map((img) => ({
            url:      img.url,
            position: img.position,
            isCover:  img.is_cover,
          })) ?? [],
        })
      })
      .catch(() => {})
      .finally(() => setLoadingEdit(false))
  }, [open, editId]) // eslint-disable-line react-hooks/exhaustive-deps

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
    params.delete('edit')
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
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

  type RawImage = { url: string; position: number; isCover: boolean; localFile?: File }

  async function uploadImages(raw: RawImage[] | undefined) {
    if (!raw?.length) return []
    return Promise.all(
      raw.map(async (img) => {
        const url = img.localFile
          ? (await uploadApi.image(img.localFile)).data.url
          : img.url
        return { url, position: img.position, is_cover: img.isCover }
      })
    )
  }

  function buildPayload(
    status: 'draft' | 'published',
    uploadedImages: Array<{ url: string; position: number; is_cover: boolean }>,
  ) {
    const d = form.getValues()
    return {
      title:            d.title,
      description:      d.description,
      price:            d.price,
      transaction_type: d.transactionType,
      property_type:    d.propertyType,
      status,
      location_id:      d.locationId,
      address:          d.address,
      latitude:         d.latitude,
      longitude:        d.longitude,
      surface:          d.surface,
      bedrooms:         d.bedrooms,
      bathrooms:        d.bathrooms,
      floor:            d.floor,
      is_furnished:     d.isFurnished ?? false,
      amenity_ids:      d.amenityIds ?? [],
      images:           uploadedImages,
    }
  }

  async function handleSaveDraft() {
    const rawImages = form.getValues('images') as RawImage[] | undefined
    setSubmitting(true)
    try {
      const images = await uploadImages(rawImages)
      const payload = buildPayload('draft', images)
      if (editId) {
        await propertiesApi.update(editId, payload)
      } else {
        await propertiesApi.create(payload)
      }
      close()
      router.push('/espace-client/annonces')
    } catch {
      // TODO: show toast error
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePublish() {
    // Capture raw images (with localFile) before form.trigger() strips unknown keys via Zod
    const rawImages = form.getValues('images') as RawImage[] | undefined
    const valid = await form.trigger()
    if (!valid) return
    setSubmitting(true)
    try {
      const images = await uploadImages(rawImages)
      const payload = buildPayload('published', images)
      if (editId) {
        await propertiesApi.update(editId, payload)
      } else {
        await propertiesApi.create(payload)
      }
      close()
      router.push('/espace-client/annonces')
    } catch {
      // TODO: show toast error
    } finally {
      setSubmitting(false)
    }
  }

  const meta          = STEPS[step - 1]
  const showAuthGate  = !authLoading && !user
  const dialogTitle   = editId ? 'Modifier le bien' : 'Publier un bien'

  return (
    <Dialog open={open} onClose={close} maxWidth="max-w-lg">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 sticky top-0 z-10 rounded-t-3xl" style={{ background: 'var(--color-surface)' }}>
        {!showAuthGate && (
          <>
            {/* Progress bar */}
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
          </>
        )}

        {showAuthGate && (
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--color-text)' }}>
              {dialogTitle}
            </h2>
            <button
              onClick={close}
              aria-label="Fermer"
              className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors"
              style={{ color: 'var(--color-muted)' }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Step content */}
      <div className="px-6 pb-2">
        {authLoading || loadingEdit ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
          </div>
        ) : showAuthGate ? (
          <Step0Auth onClose={close} />
        ) : (
          <>
            {step === 1 && <Step1Type form={form} />}
            {step === 2 && <Step2Location form={form} locations={locations} />}
            {step === 3 && <Step3Details form={form} />}
            {step === 4 && <Step4Amenities form={form} amenities={amenities} />}
            {step === 5 && <Step5Images form={form} />}
            {step === 6 && (
              <Step6Review
                form={form}
                onSaveDraft={handleSaveDraft}
                onPublish={handlePublish}
                isSubmitting={submitting}
              />
            )}
          </>
        )}
      </div>

      {/* Footer nav — only when logged in, not loading, and not on last step */}
      {!showAuthGate && !authLoading && !loadingEdit && step < 6 && (
        <div className="sticky bottom-0 px-6 pb-6 pt-4 flex items-center justify-between gap-3"
          style={{ background: 'var(--color-surface)' }}>
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
