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

function EstimationFeedback({ estimationId }: { estimationId: string }) {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading]     = useState(false)

  async function submitFeedback(opinion: Opinion) {
    if (loading || submitted) return
    setLoading(true)
    try {
      await estimationApi.feedback(estimationId, opinion)
    } catch {
      // Silent — feedback failure must not disrupt UX
    } finally {
      setLoading(false)
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <p className="text-center text-sm py-2" style={{ color: 'var(--color-primary)' }}>
        Merci pour votre retour !
      </p>
    )
  }

  return (
    <div className="text-center space-y-2">
      <p className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
        Cette estimation était-elle précise ?
      </p>
      <div className="flex items-center justify-center gap-2">
        {([
          { key: 'too_high', label: 'Trop haute' },
          { key: 'correct',  label: 'Correcte' },
          { key: 'too_low',  label: 'Trop basse' },
        ] as { key: Opinion; label: string }[]).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            disabled={loading}
            onClick={() => submitFeedback(key)}
            className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-50"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}

const IMPACT_COLOR = {
  positive: 'oklch(42% 0.09 155)',   // green
  neutral:  'var(--color-muted)',
  negative: 'oklch(50% 0.18 25)',    // red-ish
}

const IMPACT_ICON = {
  positive: '+',
  neutral:  '·',
  negative: '−',
}

export function EstStep4Result({ result, form, estimationId, onRestart, onPublish }: Props) {
  const isLocation = form.transactionType === 'location'

  return (
    <div className="space-y-5 pb-2">
      {/* Disclaimer */}
      <p className="text-xs leading-relaxed rounded-xl px-3.5 py-2.5" style={{ background: 'oklch(68% 0.1 78 / 0.1)', color: 'oklch(42% 0.07 78)' }}>
        Estimation indicative basée sur les moyennes du marché tunisien. Consultez un agent pour une évaluation précise.
      </p>

      {/* Main price range */}
      <div className="rounded-3xl p-6 text-center" style={{ background: 'oklch(42% 0.09 155 / 0.06)', border: '2px solid oklch(42% 0.09 155 / 0.15)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--color-primary)' }}>
          {isLocation ? 'Loyer estimé / mois' : 'Prix de vente estimé'}
        </p>

        <p className="font-display font-bold text-3xl mt-2" style={{ color: 'var(--color-primary)' }}>
          {fmt(result.low)} – {fmt(result.high)}
        </p>
        <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--color-primary)' }}>
          {result.unit}
        </p>

        {/* Range bar */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-xs tabular-nums" style={{ color: 'var(--color-muted)' }}>{fmt(result.low)}</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--color-border)' }}>
            <div className="h-full rounded-full" style={{ background: 'var(--color-primary)', width: '60%', marginLeft: '20%' }} />
          </div>
          <span className="text-xs tabular-nums" style={{ color: 'var(--color-muted)' }}>{fmt(result.high)}</span>
        </div>

        <p className="text-xs mt-3" style={{ color: 'var(--color-text-secondary)' }}>
          Valeur centrale : <strong style={{ color: 'var(--color-text)' }}>{fmt(result.mid)} {result.unit}</strong>
        </p>
      </div>

      {/* Key factors */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-muted)' }}>
          Facteurs clés
        </p>
        <div className="rounded-2xl border overflow-hidden divide-y" style={{ borderColor: 'var(--color-border)' }}>
          {result.factors.map((f, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <span className="text-sm font-bold mt-0.5 w-4 text-center shrink-0" style={{ color: IMPACT_COLOR[f.impact] }}>
                {IMPACT_ICON[f.impact]}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{f.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {estimationId && (
        <div className="rounded-2xl px-4 py-3 border" style={{ borderColor: 'var(--color-border)' }}>
          <EstimationFeedback estimationId={estimationId} />
        </div>
      )}

      {/* CTAs */}
      <div className="space-y-2 pt-1">
        <button
          type="button"
          onClick={onPublish}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}
        >
          Publier ce bien →
        </button>
        <button
          type="button"
          onClick={onRestart}
          className="w-full py-3 rounded-2xl text-sm font-semibold border transition-colors"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          Nouvelle estimation
        </button>
      </div>
    </div>
  )
}
