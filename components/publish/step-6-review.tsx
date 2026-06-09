import Image from 'next/image'
import { type UseFormReturn } from 'react-hook-form'
import type { WizardSchema } from './publish-dialog'

const PROPERTY_LABELS: Record<string, string> = {
  apartment: 'Appartement', villa: 'Villa', house: 'Maison',
  land: 'Terrain', commercial: 'Commercial', office: 'Bureau',
}

function fmt(n: number) { return n.toLocaleString('fr-TN') }

interface Props {
  form: UseFormReturn<WizardSchema>
  onSaveDraft: () => void
  onPublish: () => void
  isSubmitting: boolean
}

const ROWS = [
  'Type', 'Localisation', 'Prix', 'Surface', 'Chambres / SDB', 'Photos',
] as const

export function Step6Review({ form, onSaveDraft, onPublish, isSubmitting }: Props) {
  const data       = form.getValues()
  const coverImage = data.images?.find((i) => i.isCover) ?? data.images?.[0]

  const rows: { label: string; value: string }[] = [
    {
      label: 'Type',
      value: `${data.transactionType === 'sale' ? 'Vente' : 'Location'} · ${PROPERTY_LABELS[data.propertyType ?? ''] ?? '—'}`,
    },
    {
      label: 'Localisation',
      value: data.address || '—',
    },
    {
      label: 'Prix',
      value: data.price ? `${fmt(data.price)} DT${data.transactionType === 'rent' ? ' / mois' : ''}` : '—',
    },
    {
      label: 'Surface',
      value: data.surface ? `${data.surface} m²` : '—',
    },
    {
      label: 'Chambres / SDB',
      value: `${data.bedrooms ?? 0} ch. · ${data.bathrooms ?? 0} sdb.`,
    },
    {
      label: 'Photos',
      value: `${data.images?.length ?? 0} photo${(data.images?.length ?? 0) > 1 ? 's' : ''}`,
    },
  ]

  return (
    <div className="space-y-5">
      {/* Cover preview */}
      {coverImage && (
        <div className="relative h-40 overflow-hidden" style={{ borderRadius: '3px' }}>
          <Image src={coverImage.url} alt="Couverture" fill sizes="100%" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <span className="absolute bottom-3 left-4 text-white font-display font-bold text-base leading-snug">
            {data.title}
          </span>
        </div>
      )}

      {/* Summary rows */}
      <div className="overflow-hidden border-2" style={{ borderRadius: '3px', borderColor: 'var(--color-border)' }}>
        {rows.map(({ label, value }, i) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--color-border)' : undefined }}
          >
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-muted)' }}>{label}</span>
            <span className="text-sm font-medium text-right max-w-[60%] truncate" style={{ color: 'var(--color-text)' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Info strip */}
      <div
        className="flex items-start gap-3 px-4 py-3.5"
        style={{ borderRadius: '3px', border: '2px solid var(--color-border)', background: 'var(--color-surface)' }}
      >
        <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}
          style={{ color: 'var(--color-primary)' }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
        </svg>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
          En publiant, votre annonce sera visible par tous les visiteurs. Vous pourrez la modifier ou la retirer à tout moment depuis votre espace client.
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pb-1">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSubmitting}
          className="py-3.5 text-sm font-semibold border-2 transition-colors disabled:opacity-50"
          style={{ borderRadius: '3px', borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          Brouillon
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={isSubmitting}
          className="py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: 'var(--color-primary)', borderRadius: '3px' }}
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Publication…
            </>
          ) : (
            <>
              Publier maintenant
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
