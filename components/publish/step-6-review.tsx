import Image from 'next/image'
import { type UseFormReturn } from 'react-hook-form'
import type { WizardSchema } from './publish-dialog'

const PROPERTY_LABELS: Record<string, string> = {
  apartment: 'Appartement', villa: 'Villa', house: 'Maison',
  land: 'Terrain', commercial: 'Commercial', office: 'Bureau',
}

const CITY_LABELS: Record<string, string> = {
  tunis: 'Tunis', sousse: 'Sousse', hammamet: 'Hammamet',
  sfax: 'Sfax', 'la-marsa': 'La Marsa',
}

function fmt(n: number) { return n.toLocaleString('fr-TN') }

interface Props {
  form: UseFormReturn<WizardSchema>
  onSaveDraft: () => void
  onPublish: () => void
  isSubmitting: boolean
}

export function Step6Review({ form, onSaveDraft, onPublish, isSubmitting }: Props) {
  const data = form.getValues()
  const coverImage = data.images?.find((i) => i.isCover) ?? data.images?.[0]

  return (
    <div className="space-y-5">
      {/* Cover preview */}
      {coverImage && (
        <div className="relative h-40 rounded-2xl overflow-hidden">
          <Image src={coverImage.url} alt="Couverture" fill sizes="100%" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute bottom-3 left-3 text-white font-display font-semibold text-lg">
            {data.title}
          </span>
        </div>
      )}

      {/* Summary rows */}
      <div className="divide-y rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
        {[
          {
            label: 'Type',
            value: `${data.transactionType === 'sale' ? 'Vente' : 'Location'} · ${PROPERTY_LABELS[data.propertyType ?? ''] ?? '—'}`,
          },
          {
            label: 'Localisation',
            value: [CITY_LABELS[data.locationId ?? ''], data.address].filter(Boolean).join(' — ') || '—',
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
        ].map(({ label, value }) => (
          <div key={label} className="flex items-center justify-between px-4 py-3">
            <span className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>{label}</span>
            <span className="text-sm font-medium text-right max-w-[60%] truncate" style={{ color: 'var(--color-text)' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Info */}
      <p className="text-xs leading-relaxed rounded-xl p-3.5" style={{ background: 'oklch(42% 0.09 155 / 0.06)', color: 'var(--color-primary)' }}>
        En publiant, votre annonce sera visible par tous les visiteurs. Vous pourrez la modifier ou la retirer à tout moment depuis votre espace client.
      </p>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={onSaveDraft}
          disabled={isSubmitting}
          className="py-3.5 rounded-2xl text-sm font-semibold border transition-colors"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          Sauvegarder
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={isSubmitting}
          className="py-3.5 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: 'var(--color-primary)' }}
        >
          {isSubmitting ? 'Publication…' : 'Publier'}
        </button>
      </div>
    </div>
  )
}
