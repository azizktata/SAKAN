'use client'

import { useState } from 'react'
import type { EstimationResult } from '@/lib/estimation-engine'
import type { EstFormData } from './estimation-dialog'
import { estimationApi } from '@/lib/api'

function fmt(n: number) {
  return n.toLocaleString('fr-TN')
}

interface Props {
  result:       EstimationResult
  form:         EstFormData
  estimationId: string | null
  onRestart:    () => void
  onPublish:    () => void
}

type Opinion = 'too_high' | 'correct' | 'too_low'

// ── Feedback ──────────────────────────────────────────────────────────────────

const FEEDBACK_OPTIONS: { key: Opinion; label: string; Icon: React.FC }[] = [
  {
    key: 'too_high', label: 'Trop haute',
    Icon: () => (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
      </svg>
    ),
  },
  {
    key: 'correct', label: 'Correcte',
    Icon: () => (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    key: 'too_low', label: 'Trop basse',
    Icon: () => (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
      </svg>
    ),
  },
]

function EstimationFeedback({ estimationId }: { estimationId: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [selected, setSelected]   = useState<Opinion | null>(null)

  async function submitFeedback(opinion: Opinion) {
    if (loading || submitted) return
    setSelected(opinion)
    setLoading(true)
    try { await estimationApi.feedback(estimationId, opinion) } catch { /* silent */ }
    finally { setLoading(false); setSubmitted(true) }
  }

  if (submitted) {
    return (
      <div className="flex items-center justify-center gap-2 py-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
          style={{ color: 'var(--color-primary)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-sm font-semibold" style={{ color: 'var(--color-primary)' }}>
          Merci pour votre retour !
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: 'var(--color-muted)' }}>
        Cette estimation vous semble…
      </p>
      <div className="flex items-center gap-2">
        {FEEDBACK_OPTIONS.map(({ key, label, Icon }) => (
          <button key={key} type="button" disabled={loading} onClick={() => submitFeedback(key)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold border-2 transition-all disabled:opacity-50"
            style={{
              borderRadius: '3px',
              borderColor: selected === key ? 'var(--color-primary)' : 'var(--color-border)',
              background:  selected === key ? 'oklch(32% 0.08 130 / 0.07)' : 'transparent',
              color:       selected === key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}>
            <Icon />
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Platform perks ────────────────────────────────────────────────────────────

const PLATFORM_PERKS: { title: string; desc: string; Icon: React.FC }[] = [
  // {
  //   title: '0 DT de commission',
  //   desc:  'Publiez et vendez sans payer d\'intermédiaire. Tout le prix vous revient.',
  //   Icon: () => (
  //     <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
  //       <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.171-.879-1.172-2.303 0-3.182.53-.397 1.21-.598 1.879-.659" />
  //       <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  //     </svg>
  //   ),
  // },
  {
    title: 'Contact direct avec l\'acheteur',
    desc:  'Les acheteurs vous écrivent directement — pas d\'agent au milieu.',
    Icon: () => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
      </svg>
    ),
  },
  {
    title: 'Tableau de bord analytique',
    desc:  'Suivez les vues, contacts et performances de votre annonce en temps réel.',
    Icon: () => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3M9 11.25v1.5M12 9v3.75m3-6v6" />
      </svg>
    ),
  },
  {
    title: 'Acheteurs actifs, maintenant',
    desc:  "Plusieurs Tunisiens recherchent un bien comme le vôtre sur SAKAN.",
    Icon: () => (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
  },
]

// ── Gold star decoration ──────────────────────────────────────────────────────

function Stars({ count = 3, size = 14 }: { count?: number; size?: number }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="var(--color-gold)" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

// ── Price Hero ────────────────────────────────────────────────────────────────

function PriceHero({ result, isLocation }: { result: EstimationResult; isLocation: boolean }) {

  return (
    <div
      className="-mx-6 -mt-6"
      style={{ background: 'var(--color-surface)', borderBottom: '2px solid var(--color-border)' }}
    >
      <div className="px-6 pt-7 pb-6 text-center">
        {/* Label */}
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--color-muted)' }}>
          {isLocation ? 'Loyer estimé / mois' : 'Prix de vente estimé'}
        </p>

        {/* Stars · mid price · stars */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <Stars count={3} size={13} />
          <p className="font-display font-bold leading-none tabular-nums"
            style={{ fontSize: 'clamp(2rem, 6vw, 2.8rem)', color: 'var(--color-accent)', letterSpacing: '-0.04em' }}>
            {fmt(result.mid)}{' '}
            <span style={{ fontSize: '0.45em', letterSpacing: '0.02em', verticalAlign: 'middle', color: 'var(--color-accent)', opacity: 0.95 }}>DT</span>
          </p>
          <Stars count={3} size={13} />
        </div>
      

        {/* Range block */}
        <div
          className="flex items-stretch rounded-none overflow-hidden mx-auto max-w-sm"
          style={{ border: '2px solid var(--color-border)', borderRadius: '3px' }}
        >
          {/* Min */}
          <div className="flex-1 text-center py-3 px-4" style={{ borderRight: '1px solid var(--color-border)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-muted)' }}>minimum</p>
            <p className="font-display font-bold text-base tabular-nums" style={{ color: 'var(--color-text)' }}>{fmt(result.low)}</p>
          </div>

          {/* Separator icon */}
          <div className="flex items-center justify-center px-3" style={{ borderRight: '1px solid var(--color-border)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}
              style={{ color: 'var(--color-muted)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>

          {/* Max */}
          <div className="flex-1 text-center py-3 px-4">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-muted)' }}>maximum</p>
            <p className="font-display font-bold text-base tabular-nums" style={{ color: 'var(--color-text)' }}>{fmt(result.high)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function EstStep3Result({ result, form, estimationId, onRestart, onPublish }: Props) {
  const isLocation = form.transactionType === 'location'

  return (
    <div className="space-y-5 pb-2">

      {/* Price hero */}
      <PriceHero result={result} isLocation={isLocation} />

      {/* ── Encouragement block ───────────────────────────────────────── */}
      <div className="flex items-start gap-3 px-4 py-4"
        style={{ borderRadius: '3px', border: '2px solid var(--color-border)', background: 'var(--color-surface)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{ background: 'var(--color-surface-warm)', color: 'var(--color-primary)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold leading-snug mb-0.5" style={{ color: 'var(--color-text)', letterSpacing: '-0.01em' }}>
            Publiez ce bien sur SAKAN — gratuitement
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--color-muted)' }}>
            Des acheteurs actifs attendent. Vendez directement, sans commission, sans intermédiaire.
          </p>
        </div>
      </div>

      {/* ── Platform perks ────────────────────────────────────────────── */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
          Pourquoi publier sur SAKAN
        </p>
        <div style={{ borderRadius: '3px', border: '2px solid var(--color-border)', background: 'var(--color-surface)', overflow: 'hidden' }}>
          {PLATFORM_PERKS.map(({ title, desc, Icon }, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3.5"
              style={{ borderBottom: i < PLATFORM_PERKS.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: 'var(--color-surface-warm)', color: 'var(--color-primary)' }}>
                <Icon />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>{title}</p>
                <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--color-muted)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Feedback ──────────────────────────────────────────────────── */}
      {estimationId && (
        <div className="px-4 py-4"
          style={{ borderRadius: '3px', border: '2px solid var(--color-border)', background: 'var(--color-surface)' }}>
          <EstimationFeedback estimationId={estimationId} />
        </div>
      )}

      {/* ── CTAs ──────────────────────────────────────────────────────── */}
      <div className="space-y-2.5 pt-1">
        <button type="button" onClick={onPublish}
          className="w-full py-4 text-sm font-bold text-white flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-accent)', borderRadius: '3px' }}>
          Publier ce bien gratuitement
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>
        <button type="button" onClick={onRestart}
          className="w-full py-3.5 text-sm font-bold border-2 flex items-center justify-center gap-2 transition-colors"
          style={{ borderRadius: '3px', borderColor: 'var(--color-border-strong)', color: 'var(--color-text-secondary)', background: 'transparent' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Nouvelle estimation
        </button>
      </div>
    </div>
  )
}
