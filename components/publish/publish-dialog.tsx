'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
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

export const STEPS = [
  { title: 'Type de bien',  subtitle: 'Transaction et catégorie' },
  { title: 'Localisation',  subtitle: 'Où se trouve le bien ?' },
  { title: 'Détails',       subtitle: 'Caractéristiques du bien' },
  { title: 'Équipements',   subtitle: 'Critères disponibles' },
  { title: 'Photos',        subtitle: 'Ajoutez des photos attractives' },
  { title: 'Vérification',  subtitle: 'Relisez avant de publier' },
]

export const TOTAL = STEPS.length


// ── Step header ───────────────────────────────────────────────────────────────

function StepHeader({ step, onClose, editId }: { step: number; onClose: () => void; editId?: string }) {
  const meta = STEPS[step - 1]
  return (
    <div className="sticky top-0 z-10 rounded-t-3xl" style={{ background: 'var(--color-primary)' }}>
      {/* Step indicators */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4">
        <div className="flex items-center gap-1.5">
          {STEPS.map((_, i) => {
            const idx     = i + 1
            const done    = idx < step
            const current = idx === step
            return (
              <div key={i} className="flex items-center gap-1.5">
                <div
                  className="flex items-center justify-center rounded-full text-[10px] font-bold transition-all duration-300"
                  style={{
                    width: '22px', height: '22px',
                    background: done ? 'var(--color-accent)' : current ? 'white' : 'oklch(100% 0 0 / 0.12)',
                    color: done ? 'white' : current ? 'var(--color-primary)' : 'oklch(100% 0 0 / 0.4)',
                  }}
                >
                  {done ? (
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : idx}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-3 h-px transition-all duration-300"
                    style={{ background: done ? 'var(--color-accent)' : 'oklch(100% 0 0 / 0.2)' }} />
                )}
              </div>
            )
          })}
        </div>
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="w-8 h-8 rounded-full flex items-center justify-center transition-colors shrink-0"
          style={{ background: 'oklch(100% 0 0 / 0.12)', color: 'oklch(100% 0 0 / 0.7)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      {/* Title */}
      <div className="px-6 pb-5">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'oklch(60% 0.012 70)' }}>
          {editId ? 'Modification' : 'Publication'} · Étape {step} sur {TOTAL}
        </p>
        <h2 className="font-display font-bold leading-tight" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: 'white', letterSpacing: '-0.02em' }}>
          {meta.title}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'oklch(68% 0.012 70)' }}>
          {meta.subtitle}
        </p>
      </div>
    </div>
  )
}

// ── Auth gate header ──────────────────────────────────────────────────────────

function AuthHeader({ onClose, editId }: { onClose: () => void; editId?: string }) {
  return (
    <div className="rounded-t-3xl" style={{ background: 'var(--color-primary)' }}>
      <div className="flex items-center justify-between px-6 pt-5 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'oklch(60% 0.012 70)' }}>
            SAKAN
          </p>
          <h2 className="font-display font-bold leading-tight" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: 'white', letterSpacing: '-0.02em' }}>
            {editId ? 'Modifier le bien' : 'Publier un bien'}
          </h2>
        </div>
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'oklch(100% 0 0 / 0.12)', color: 'oklch(100% 0 0 / 0.7)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function PublishDialog() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()
  const { user, loading: authLoading } = useAuth()
  const toast = useToast()

  const open   = searchParams.get('publish') === 'open'
  const editId = searchParams.get('edit') ?? undefined

  const [step, setStep]               = useState(1)
  const [submitting, setSubmitting]   = useState(false)
  const [loadingEdit, setLoadingEdit] = useState(false)
  const [locations, setLocations]     = useState<Location[]>([])
  const [amenities, setAmenities]     = useState<Amenity[]>([])
  const estPrefillRef = useRef<{
    isFurnished: boolean; hasParking: boolean; hasElevator: boolean
    hasGarden: boolean; hasPool: boolean; hasTerrace: boolean
    hasBalcony: boolean; hasSecurity: boolean; hasAirConditioning: boolean; hasHeating: boolean
  } | null>(null)
  const prefillCitySlugRef = useRef<string | null>(null)

  useEffect(() => {
    if (!open) return
    referenceApi.locations().then((r) => setLocations(r.data)).catch(() => {})
    referenceApi.amenities().then((r) => setAmenities(r.data)).catch(() => {})
  }, [open])

  useEffect(() => {
    if (!open || !user || editId) return
    if (typeof window === 'undefined') return
    const raw = sessionStorage.getItem('sakan_est_prefill')
    if (!raw) return
    try {
      const est = JSON.parse(raw) as {
        transactionType: 'vente' | 'location'
        propertyType: string
        citySlug?: string
        governorate?: string
        address?: string
        surface: number
        bedrooms: number
        bathrooms: number
        floor: number
        isFurnished: boolean
        hasParking: boolean
        hasElevator: boolean
        hasGarden: boolean
        hasPool: boolean
        hasTerrace?: boolean
        hasBalcony?: boolean
        hasSecurity?: boolean
        hasAirConditioning?: boolean
        hasHeating?: boolean
        estimatedPrice?: number
      }
      form.setValue('transactionType', est.transactionType === 'vente' ? 'sale' : 'rent')
      form.setValue('propertyType', est.propertyType as WizardSchema['propertyType'])
      form.setValue('surface', est.surface)
      form.setValue('bedrooms', est.bedrooms)
      form.setValue('bathrooms', est.bathrooms)
      form.setValue('floor', est.floor)
      form.setValue('isFurnished', est.isFurnished)
      if (est.estimatedPrice) form.setValue('price', est.estimatedPrice)
      if (est.address) {
        form.setValue('address', est.address)
      } else if (est.governorate) {
        form.setValue('address', est.governorate)
      }
      if (est.citySlug) prefillCitySlugRef.current = est.citySlug
      estPrefillRef.current = {
        isFurnished:        est.isFurnished,
        hasParking:         est.hasParking,
        hasElevator:        est.hasElevator,
        hasGarden:          est.hasGarden,
        hasPool:            est.hasPool,
        hasTerrace:         est.hasTerrace         ?? false,
        hasBalcony:         est.hasBalcony          ?? false,
        hasSecurity:        est.hasSecurity         ?? false,
        hasAirConditioning: est.hasAirConditioning  ?? false,
        hasHeating:         est.hasHeating          ?? false,
      }
      sessionStorage.removeItem('sakan_est_prefill')
      setStep(3)
    } catch {
      // ignore malformed data
    }
  }, [open, user]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!locations.length || !prefillCitySlugRef.current) return
    const slug = prefillCitySlugRef.current
    prefillCitySlugRef.current = null
    const match = locations.find((loc) =>
      loc.slug === slug ||
      loc.name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-') === slug
    )
    if (match) form.setValue('locationId', String(match.id))
  }, [locations]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!amenities.length || !estPrefillRef.current) return
    const flags = estPrefillRef.current
    estPrefillRef.current = null
    const AMENITY_MAP: { flag: keyof typeof flags; names: string[] }[] = [
      { flag: 'isFurnished',        names: ['meublé', 'meuble'] },
      { flag: 'hasParking',         names: ['parking', 'garage'] },
      { flag: 'hasElevator',        names: ['ascenseur'] },
      { flag: 'hasGarden',          names: ['jardin'] },
      { flag: 'hasPool',            names: ['piscine'] },
      { flag: 'hasTerrace',         names: ['terrasse'] },
      { flag: 'hasBalcony',         names: ['balcon'] },
      { flag: 'hasSecurity',        names: ['sécurité', 'securite', 'gardiennage'] },
      { flag: 'hasAirConditioning', names: ['climatisation', 'clim'] },
      { flag: 'hasHeating',         names: ['chauffage'] },
    ]
    const ids: string[] = []
    for (const { flag, names } of AMENITY_MAP) {
      if (!flags[flag]) continue
      const match = amenities.find((a) =>
        names.some((n) => a.name.toLowerCase().includes(n))
      )
      if (match) ids.push(String(match.id))
    }
    if (ids.length) form.setValue('amenityIds', ids)
  }, [amenities]) // eslint-disable-line react-hooks/exhaustive-deps

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
        toast('Brouillon mis à jour.')
      } else {
        await propertiesApi.create(payload)
        toast('Brouillon enregistré.')
      }
      close()
      router.push('/espace-client/annonces')
    } catch {
      toast('Une erreur est survenue. Réessayez.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePublish() {
    const rawImages = form.getValues('images') as RawImage[] | undefined
    const valid = await form.trigger()
    if (!valid) return
    setSubmitting(true)
    try {
      const images = await uploadImages(rawImages)
      const payload = buildPayload('published', images)
      if (editId) {
        await propertiesApi.update(editId, payload)
        toast('Bien mis à jour et publié.')
      } else {
        await propertiesApi.create(payload)
        toast('Bien publié avec succès !')
      }
      close()
      router.push('/espace-client/annonces')
    } catch {
      toast('Une erreur est survenue. Réessayez.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const showAuthGate  = !authLoading && !user
  const isLastStep    = step === TOTAL

  return (
    <Dialog open={open} onClose={close} maxWidth="max-w-2xl" scrollKey={step}>

      {/* Auth gate */}
      {showAuthGate && (
        <>
          <AuthHeader onClose={close} editId={editId} />
          <div className="px-6 py-6" style={{ background: 'var(--color-bg)' }}>
            <Step0Auth onClose={close} />
          </div>
        </>
      )}

      {/* Loading */}
      {!showAuthGate && (authLoading || loadingEdit) && (
        <>
          <AuthHeader onClose={close} editId={editId} />
          <div className="flex justify-center py-16" style={{ background: 'var(--color-bg)' }}>
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
          </div>
        </>
      )}

      {/* Steps */}
      {!showAuthGate && !authLoading && !loadingEdit && (
        <>
          <StepHeader step={step} onClose={close} editId={editId} />

          {/* Content */}
          <div className="px-6 pt-6 pb-2" style={{ background: 'var(--color-bg)' }}>
            {step === 1 && <Step1Type      form={form} />}
            {step === 2 && <Step2Location  form={form} locations={locations} />}
            {step === 3 && <Step3Details   form={form} />}
            {step === 4 && <Step4Amenities form={form} amenities={amenities} />}
            {step === 5 && <Step5Images    form={form} />}
            {step === 6 && (
              <Step6Review
                form={form}
                onSaveDraft={handleSaveDraft}
                onPublish={handlePublish}
                isSubmitting={submitting}
              />
            )}
          </div>

          {/* Footer — not shown on last step (actions are inside Step6Review) */}
          {!isLastStep && (
            <div
              className="sticky bottom-0 px-6 pb-6 pt-4 flex items-center justify-between gap-3"
              style={{ background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}
            >
              <button
                type="button"
                onClick={goPrev}
                disabled={step === 1}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold border-2 transition-colors disabled:opacity-40"
                style={{ borderRadius: '3px', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-secondary)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Précédent
              </button>

              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-2 px-7 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--color-primary)', borderRadius: '3px' }}
              >
                Suivant
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </Dialog>
  )
}
