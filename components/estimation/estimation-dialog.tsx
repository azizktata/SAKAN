'use client'

import { useCallback, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Dialog } from '@/components/ui/dialog'
import { estimate, type EstimationInput, type EstimationResult } from '@/lib/estimation-engine'
import { estimationApi } from '@/lib/api'
import { EstStep1TypeLocation } from './est-step1-type-location'
import { EstStep2Details } from './est-step-2-details'
import { EstStep3Result } from './est-step-3-result'

// ── Types ─────────────────────────────────────────────────────────────────────

export type BuildingYearRange = '2020+' | '2010-2019' | '2000-2009' | '1990-1999' | '1980-1989' | 'avant-1980'

export type EstFormData = EstimationInput & {
  governorate:        string
  neighborhood:       string
  zoneScore:          number
  latitude:           number | null
  longitude:          number | null
  hasTerrace:         boolean
  hasBalcony:         boolean
  hasSecurity:        boolean
  hasAirConditioning: boolean
  hasHeating:         boolean
  parkingSpaces:      number
  gardenSurface:      number
  terraceSurface:     number
  buildingYearRange:  BuildingYearRange | null
}

const DEFAULT_FORM: EstFormData = {
  transactionType:    'vente',
  propertyType:       'apartment',
  citySlug:           'tunis',
  governorate:        'Tunis',
  neighborhood:       '',
  zoneScore:          4,
  latitude:           null,
  longitude:          null,
  surface:            80,
  bedrooms:           2,
  bathrooms:          1,
  floor:              1,
  condition:          'bon_etat',
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

// Steps after the intro: 1 = type+location, 2 = details, 3 = result
const STEPS = [
  { title: 'Bien & Localisation', subtitle: 'Type, transaction et emplacement' },
  { title: 'Caractéristiques',    subtitle: 'Surface, état et équipements' },
  { title: 'Estimation',          subtitle: 'Résultat de l\'analyse IA' },
]

const TOTAL = STEPS.length

// ── Circuit-board SVG pattern ─────────────────────────────────────────────────

function CircuitPattern() {
  return (
    <svg
      aria-hidden="true"
      className="absolute inset-0 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.07 }}
    >
      <defs>
        <pattern id="circuit" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          {/* Horizontal lines */}
          <line x1="0" y1="20" x2="30" y2="20" stroke="white" strokeWidth="1" />
          <line x1="50" y1="20" x2="80" y2="20" stroke="white" strokeWidth="1" />
          <line x1="0" y1="60" x2="20" y2="60" stroke="white" strokeWidth="1" />
          <line x1="40" y1="60" x2="80" y2="60" stroke="white" strokeWidth="1" />
          {/* Vertical lines */}
          <line x1="20" y1="0" x2="20" y2="15" stroke="white" strokeWidth="1" />
          <line x1="20" y1="25" x2="20" y2="55" stroke="white" strokeWidth="1" />
          <line x1="20" y1="65" x2="20" y2="80" stroke="white" strokeWidth="1" />
          <line x1="60" y1="0" x2="60" y2="40" stroke="white" strokeWidth="1" />
          <line x1="60" y1="55" x2="60" y2="80" stroke="white" strokeWidth="1" />
          {/* Corner connectors */}
          <line x1="30" y1="20" x2="30" y2="40" stroke="white" strokeWidth="1" />
          <line x1="30" y1="40" x2="50" y2="40" stroke="white" strokeWidth="1" />
          <line x1="50" y1="40" x2="50" y2="20" stroke="white" strokeWidth="1" />
          <line x1="40" y1="60" x2="40" y2="47" stroke="white" strokeWidth="1" />
          <line x1="40" y1="47" x2="60" y2="47" stroke="white" strokeWidth="1" />
          {/* Nodes */}
          <circle cx="20" cy="20" r="2.5" fill="white" />
          <circle cx="60" cy="20" r="2.5" fill="white" />
          <circle cx="20" cy="60" r="2.5" fill="white" />
          <circle cx="60" cy="60" r="2.5" fill="white" />
          <circle cx="30" cy="40" r="2" fill="white" />
          <circle cx="50" cy="40" r="2" fill="white" />
          <circle cx="40" cy="47" r="1.5" fill="white" />
          {/* Small pads */}
          <rect x="17.5" y="14" width="5" height="2" rx="1" fill="white" />
          <rect x="57.5" y="38" width="5" height="2" rx="1" fill="white" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit)" />
    </svg>
  )
}

// ── AI brain / spark icon ─────────────────────────────────────────────────────

function AIIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 48 48" stroke="currentColor" strokeWidth={1.5}
      style={{ color: 'white' }}>
      {/* Stylised circuit-brain */}
      <circle cx="24" cy="24" r="10" strokeDasharray="4 2" />
      <line x1="24" y1="8" x2="24" y2="14" />
      <line x1="24" y1="34" x2="24" y2="40" />
      <line x1="8" y1="24" x2="14" y2="24" />
      <line x1="34" y1="24" x2="40" y2="24" />
      <circle cx="24" cy="8"  r="2" fill="currentColor" stroke="none" />
      <circle cx="24" cy="40" r="2" fill="currentColor" stroke="none" />
      <circle cx="8"  cy="24" r="2" fill="currentColor" stroke="none" />
      <circle cx="40" cy="24" r="2" fill="currentColor" stroke="none" />
      {/* Inner spark */}
      <path strokeLinecap="round" strokeLinejoin="round" d="M26 20l-4 5h4l-4 5" />
    </svg>
  )
}

// ── Intro hero (step 0) ───────────────────────────────────────────────────────

function IntroScreen({ onStart, onClose }: { onStart: () => void; onClose: () => void }) {
  const features = [
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
        </svg>
      ),
      title: 'Données marché réelles',
      desc:  'Basé sur des milliers de transactions tunisiennes 2026',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.357 2.058l.97.485a2.25 2.25 0 001.623 0l.97-.485A2.25 2.25 0 0018.75 8.82V3.104m0 0c.249.032.499.059.75.082M5 14.5l-.75.75A2.25 2.25 0 002 17.5v1.5a2.25 2.25 0 002.25 2.25h15.5A2.25 2.25 0 0022 19v-1.5a2.25 2.25 0 00-2.25-2.25L19 14.5m-14 0h14" />
        </svg>
      ),
      title: 'Modèle IA entraîné',
      desc:  'Machine learning calibré sur le marché immobilier tunisien',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
        </svg>
      ),
      title: 'Fourchette de précision',
      desc:  'Intervalle bas / central / haut avec score de confiance',
    },
    {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Résultat en 30 secondes',
      desc:  '2 étapes simples — aucun compte requis',
    },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-[520px]">

      {/* ── Left dark panel ─────────────────────────────────────────────── */}
      <div
        className="relative md:w-[42%] flex flex-col justify-between p-8 overflow-hidden"
        style={{ background: 'var(--color-primary)' }}
      >
        <CircuitPattern />

        {/* Top */}
        <div className="relative">
          {/* Close button */}
          

          {/* AI badge */}
          <div className="flex items-center gap-2.5 mb-8">
            {/* <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'oklch(100% 0 0 / 0.1)', border: '1px solid oklch(100% 0 0 / 0.2)' }}
            >
              <AIIcon />
            </div> */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'oklch(65% 0.012 70)' }}>
                SAKAN IA
              </p>
              <p className="text-xs font-medium" style={{ color: 'oklch(55% 0.01 70)' }}>
                Estimation immobilière
              </p>
            </div>
          </div>

          <h2
            className="font-display font-bold text-white leading-tight mb-3"
            style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '-0.025em' }}
          >
            Estimez votre bien en quelques clics
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: 'oklch(68% 0.012 70)' }}>
            Notre moteur IA analyse les données du marché tunisien pour vous donner une fourchette de prix précise et objective.
          </p>
        </div>

        {/* Bottom accent dots */}
       
      </div>

      {/* ── Right light panel ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-between p-8" style={{ background: 'var(--color-bg)' }}>

        {/* Feature list */}
        <div>
          <div className="flex justify-between items-center gap-2.5 mb-6">

          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>
            Ce que vous obtenez
          </p>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="cursor-pointer w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          </div>
          <div className="space-y-4">
            {features.map((f, i) => (
              <div key={i} className="flex items-start gap-3.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'var(--color-surface-warm)', color: 'var(--color-primary)' }}
                >
                  {f.icon}
                </div>
                <div className="pt-0.5">
                  <p className="text-sm font-semibold" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
                    {f.title}
                  </p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-8 space-y-3">
          <button
            type="button"
            onClick={onStart}
            className="w-full py-4 text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-accent)', borderRadius: '3px' }}
          >
            Démarrer l&apos;estimation
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="text-center text-xs" style={{ color: 'var(--color-muted)' }}>
            Gratuit · Sans inscription · Estimation en 2 étapes
          </p>
        </div>
      </div>
    </div>
  )
}

// ── Step header (shown for steps 1–3) ────────────────────────────────────────

function StepHeader({ step, onClose }: { step: number; onClose: () => void }) {
  const meta = STEPS[step - 1]
  return (
    <div className="relative sticky top-0 z-10 rounded-t-3xl overflow-hidden" style={{ background: 'var(--color-primary)' }}>
      <CircuitPattern />
      {/* Step indicators */}
      <div className="relative flex items-center justify-between px-6 pt-5 pb-4">
        <div className="flex items-center gap-2">
          {STEPS.map((_, i) => {
            const idx     = i + 1
            const done    = idx < step
            const current = idx === step
            return (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="flex items-center justify-center rounded-full text-xs font-bold transition-all duration-300"
                  style={{
                    width: '28px', height: '28px',
                    background: done ? 'var(--color-accent)' : current ? 'white' : 'oklch(100% 0 0 / 0.12)',
                    color: done ? 'white' : current ? 'var(--color-primary)' : 'oklch(100% 0 0 / 0.4)',
                  }}
                >
                  {done ? (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : idx}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="w-5 h-px transition-all duration-300"
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
      <div className="relative px-6 pb-5">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'oklch(60% 0.012 70)' }}>
          Étape {step} sur {TOTAL}
        </p>
        <h2 className="font-display font-bold leading-tight" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.45rem)', color: 'white', letterSpacing: '-0.02em' }}>
          {meta.title}
        </h2>
        <p className="text-sm mt-1" style={{ color: 'oklch(68% 0.012 70)' }}>
          {meta.subtitle}
        </p>
      </div>
    </div>
  )
}

// ── Main dialog ───────────────────────────────────────────────────────────────

export function EstimationDialog() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const pathname     = usePathname()

  const open = searchParams.get('estimer') === 'open'

  // step 0 = intro, 1..3 = form steps
  const [step, setStep]                 = useState(0)
  const [form, setForm]                 = useState<EstFormData>(DEFAULT_FORM)
  const [result, setResult]             = useState<EstimationResult | null>(null)
  const [estimationId, setEstimationId] = useState<string | null>(null)
  const [estimating, setEstimating]     = useState(false)

  const close = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('estimer')
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
    setTimeout(() => {
      setStep(0)
      setForm(DEFAULT_FORM)
      setResult(null)
      setEstimationId(null)
    }, 300)
  }, [searchParams, router, pathname])

  function goNext() { if (step < TOTAL) setStep(s => s + 1) }
  function goPrev() { if (step > 1)     setStep(s => s - 1) }

  const YEAR_RANGE_TO_AGE: Record<string, number> = {
    '2020+': 2, '2010-2019': 12, '2000-2009': 22,
    '1990-1999': 32, '1980-1989': 42, 'avant-1980': 55,
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
        governorate:      form.governorate  || undefined,
        garden_surface:   form.hasGarden  && form.gardenSurface  > 0 ? form.gardenSurface  : undefined,
        parking_spaces:   form.hasParking ? form.parkingSpaces : undefined,
        terrace_surface:  form.hasTerrace && form.terraceSurface > 0 ? form.terraceSurface : undefined,
        building_age:     buildingAge,
        latitude:         form.latitude  ?? undefined,
        longitude:        form.longitude ?? undefined,
      })

      if (apiResult.estimation_id) setEstimationId(apiResult.estimation_id)

      if (!apiResult.fallback) {
        const cityLabel = form.citySlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        const locLabel  = form.neighborhood ? `${form.neighborhood}, ${cityLabel}` : cityLabel
        setResult({
          low: apiResult.low, mid: apiResult.mid, high: apiResult.high, unit: apiResult.unit,
          factors: [
            { label: 'Localisation', impact: 'neutral',   detail: `${locLabel} — données marché réelles` },
            { label: 'Surface',      impact: 'neutral',   detail: `${form.surface} m² — base de calcul` },
            ...(apiResult.confidence !== undefined ? [{
              label: 'Fiabilité',
              impact: (apiResult.confidence >= 0.6 ? 'positive' : 'neutral') as 'positive' | 'neutral',
              detail: `Score de confiance : ${Math.round(apiResult.confidence * 100)}%`,
            }] : []),
          ],
        })
        setEstimating(false)
        setStep(3)
        return
      }
    } catch { /* fall through */ }

    setResult(estimate(form))
    setEstimating(false)
    setStep(3)
  }

  function handleRestart() {
    setStep(0)
    setForm(DEFAULT_FORM)
    setResult(null)
    setEstimationId(null)
  }

  function openPublish() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('sakan_est_prefill', JSON.stringify({ ...form, estimatedPrice: result?.mid }))
    }
    const params = new URLSearchParams(searchParams.toString())
    params.delete('estimer')
    params.set('publish', 'open')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    setTimeout(() => { setStep(0); setForm(DEFAULT_FORM); setResult(null) }, 300)
  }

  const isResultStep    = step === 3
  const isLastInputStep = step === 2

  return (
    <Dialog open={open} onClose={close} maxWidth="max-w-2xl" scrollKey={step}>

      {/* Intro */}
      {step === 0 && <IntroScreen onStart={() => setStep(1)} onClose={close} />}

      {/* Steps 1–3 */}
      {step >= 1 && (
        <>
          <StepHeader step={step} onClose={close} />

          {/* Content */}
          <div className="px-6 pt-6 pb-2" style={{ background: 'var(--color-bg)' }}>
            {step === 1 && <EstStep1TypeLocation form={form} setForm={setForm} />}
            {step === 2 && <EstStep2Details      form={form} setForm={setForm} />}
            {step === 3 && result && (
              <EstStep3Result
                result={result}
                form={form}
                estimationId={estimationId}
                onRestart={handleRestart}
                onPublish={openPublish}
              />
            )}
          </div>

          {/* Footer */}
          {!isResultStep && (
            <div
              className="sticky bottom-0 px-6 pb-6 pt-4 flex items-center justify-between gap-3"
              style={{ background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)' }}
            >
              <button
                type="button"
                onClick={step === 1 ? () => setStep(0) : goPrev}
                className="flex items-center gap-2 px-5 py-3 text-sm font-semibold border-2 transition-colors"
                style={{ borderRadius: '3px', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-secondary)' }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Précédent
              </button>

              {isLastInputStep ? (
                <button
                  type="button"
                  onClick={handleEstimate}
                  disabled={estimating}
                  className="flex items-center gap-2 px-7 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
                  style={{ background: 'var(--color-accent)', borderRadius: '3px' }}
                >
                  {estimating ? (
                    <>
                      <svg className="w-4 h-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      Analyse en cours…
                    </>
                  ) : (
                    <>
                      Lancer l&apos;estimation IA
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              ) : (
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
              )}
            </div>
          )}
        </>
      )}
    </Dialog>
  )
}
