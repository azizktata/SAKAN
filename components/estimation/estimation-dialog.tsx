'use client'

import { useCallback, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Dialog } from '@/components/ui/dialog'
import { estimate, type EstimationInput, type EstimationResult } from '@/lib/estimation-engine'
import { estimationApi } from '@/lib/api'
import { EstStep1Type } from './est-step-1-type'
import { EstStep2Location } from './est-step-2-location'
import { EstStep3Details } from './est-step-3-details'
import { EstStep4Result } from './est-step-4-result'

// ── Types ─────────────────────────────────────────────────────────────────────

export type BuildingYearRange = '2020+' | '2010-2019' | '2000-2009' | '1990-1999' | '1980-1989' | 'avant-1980'

export type EstFormData = EstimationInput & {
  governorate:      string
  neighborhood:     string
  zoneScore:        number
  latitude:         number | null
  longitude:        number | null
  // Extended amenities (beyond the 5 in EstimationInput)
  hasTerrace:       boolean
  hasBalcony:       boolean
  hasSecurity:      boolean
  hasAirConditioning: boolean
  hasHeating:       boolean
  // Amenity sub-inputs (only relevant when parent flag is true)
  parkingSpaces:    number
  gardenSurface:    number   // m²
  terraceSurface:   number   // m²
  // Construction year
  buildingYearRange: BuildingYearRange | null
}

const DEFAULT_FORM: EstFormData = {
  transactionType: 'vente',
  propertyType:    'apartment',
  citySlug:        'tunis',
  governorate:     'Tunis',
  neighborhood:    '',
  zoneScore:       4,
  latitude:        null,
  longitude:       null,
  surface:         80,
  bedrooms:        2,
  bathrooms:       1,
  floor:           1,
  condition:       'bon_etat',
  isFurnished:        false,
  hasParking:         false,
  hasElevator:        false,
  hasGarden:          false,
  hasPool:            false,
  hasTerrace:         false,
  hasBalcony:         false,
  hasSecurity:        false,
  hasAirConditioning: false,
  hasHeating:         false,
  parkingSpaces:      1,
  gardenSurface:      0,
  terraceSurface:     0,
  buildingYearRange:  null,
}

const STEPS = [
  { title: 'Type de transaction', subtitle: 'Vente ou location ?' },
  { title: 'Localisation',        subtitle: 'Où se situe le bien ?' },
  { title: 'Caractéristiques',    subtitle: 'Décrivez votre bien' },
  { title: 'Estimation',          subtitle: 'Résultat de l\'estimation' },
]

const TOTAL = STEPS.length

// ── Component ─────────────────────────────────────────────────────────────────

export function EstimationDialog() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()

  const open = searchParams.get('estimer') === 'open'

  const [step, setStep]             = useState(1)
  const [form, setForm]             = useState<EstFormData>(DEFAULT_FORM)
  const [result, setResult]         = useState<EstimationResult | null>(null)
  const [estimationId, setEstimationId] = useState<string | null>(null)
  const [estimating, setEstimating] = useState(false)

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('estimer')
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
    setTimeout(() => {
      setStep(1)
      setForm(DEFAULT_FORM)
      setResult(null)
      setEstimationId(null)
    }, 300)
  }, [searchParams, router, pathname])

  function goNext() {
    if (step < TOTAL) setStep((s) => s + 1)
  }

  function goPrev() {
    if (step > 1) setStep((s) => s - 1)
  }

  const YEAR_RANGE_TO_AGE: Record<string, number> = {
    '2020+':     2,
    '2010-2019': 12,
    '2000-2009': 22,
    '1990-1999': 32,
    '1980-1989': 42,
    'avant-1980': 55,
  }

  async function handleEstimate() {
    setEstimating(true)
    const amenitiesCount = [
      form.hasParking, form.hasElevator, form.hasGarden, form.hasPool, form.isFurnished,
      form.hasTerrace, form.hasBalcony, form.hasSecurity, form.hasAirConditioning, form.hasHeating,
    ].filter(Boolean).length

    const buildingAge = form.buildingYearRange ? YEAR_RANGE_TO_AGE[form.buildingYearRange] : undefined

    try {
      const apiResult = await estimationApi.estimate({
        city:             form.citySlug,
        property_type:    form.propertyType,
        transaction_type: form.transactionType,
        surface:          form.surface,
        bedrooms:         form.bedrooms,
        condition:        form.condition,
        zone_score:       form.zoneScore,
        amenities_count:  amenitiesCount,
        neighborhood:     form.neighborhood || undefined,
        governorate:      form.governorate || undefined,
        garden_surface:   form.hasGarden && form.gardenSurface > 0 ? form.gardenSurface : undefined,
        parking_spaces:   form.hasParking ? form.parkingSpaces : undefined,
        terrace_surface:  form.hasTerrace && form.terraceSurface > 0 ? form.terraceSurface : undefined,
        building_age:     buildingAge,
        latitude:         form.latitude  ?? undefined,
        longitude:        form.longitude ?? undefined,
      })

      if (apiResult.estimation_id) {
        setEstimationId(apiResult.estimation_id)
      }

      if (!apiResult.fallback) {
        // Build location label: "Khezama, Sousse" or just "Tunis"
        const cityLabel = form.citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        const locLabel  = form.neighborhood ? `${form.neighborhood}, ${cityLabel}` : cityLabel

        setResult({
          low:     apiResult.low,
          mid:     apiResult.mid,
          high:    apiResult.high,
          unit:    apiResult.unit,
          factors: [
            { label: 'Localisation', impact: 'neutral', detail: `${locLabel} — données marché réelles` },
            { label: 'Surface',      impact: 'neutral', detail: `${form.surface} m² — base de calcul` },
            ...(apiResult.confidence !== undefined
              ? [{ label: 'Fiabilité', impact: (apiResult.confidence >= 0.6 ? 'positive' : 'neutral') as 'positive' | 'neutral', detail: `Score de confiance : ${Math.round(apiResult.confidence * 100)}%` }]
              : []),
          ],
        })
        setEstimating(false)
        setStep(4)
        return
      }
    } catch {
      // Network error or ML unavailable — fall through to local engine
    }

    // Fallback: local heuristic engine
    const res = estimate(form)
    setResult(res)
    setEstimating(false)
    setStep(4)
  }

  function handleRestart() {
    setStep(1)
    setForm(DEFAULT_FORM)
    setResult(null)
    setEstimationId(null)
  }

  function openPublish() {
    // Persist estimation data so publish dialog can pre-fill matching fields
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('sakan_est_prefill', JSON.stringify({
        ...form,
        estimatedPrice: result?.mid,
      }))
    }
    const params = new URLSearchParams(searchParams.toString())
    params.delete('estimer')
    params.set('publish', 'open')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    setTimeout(() => {
      setStep(1)
      setForm(DEFAULT_FORM)
      setResult(null)
    }, 300)
  }

  const meta = STEPS[step - 1]
  const isLastInputStep = step === 3
  const isResultStep    = step === 4

  return (
    <Dialog open={open} onClose={close} maxWidth="max-w-lg" scrollKey={step}>
      {/* Header */}
      <div className="px-6 pt-6 pb-4 sticky top-0 z-10 rounded-t-3xl" style={{ background: 'var(--color-surface)' }}>
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
      </div>

      {/* Step content */}
      <div className="px-6 pb-2">
        {step === 1 && <EstStep1Type form={form} setForm={setForm} />}
        {step === 2 && <EstStep2Location form={form} setForm={setForm} />}
        {step === 3 && <EstStep3Details form={form} setForm={setForm} />}
        {step === 4 && result && (
          <EstStep4Result
            result={result}
            form={form}
            estimationId={estimationId}
            onRestart={handleRestart}
            onPublish={openPublish}
          />
        )}
      </div>

      {/* Footer nav */}
      {!isResultStep && (
        <div
          className="sticky bottom-0 px-6 pb-6 pt-4 flex items-center justify-between gap-3"
          style={{ background: 'var(--color-surface)' }}
        >
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

          {isLastInputStep ? (
            <button
              type="button"
              onClick={handleEstimate}
              disabled={estimating}
              className="px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-70 flex items-center gap-2"
              style={{ background: 'var(--color-primary)' }}
            >
              {estimating && (
                <svg className="w-4 h-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              )}
              {estimating ? 'Estimation en cours…' : 'Estimer maintenant'}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-primary)' }}
            >
              Suivant
            </button>
          )}
        </div>
      )}
    </Dialog>
  )
}
