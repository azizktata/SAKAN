import type { UseFormReturn } from 'react-hook-form'
import type { WizardSchema } from './publish-dialog'

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconVente() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
    </svg>
  )
}

function IconLocation() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
    </svg>
  )
}

function IconApartment() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  )
}

function IconVilla() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
    </svg>
  )
}

function IconHouse() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  )
}

function IconLand() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  )
}

function IconCommercial() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  )
}

function IconOffice() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

const TRANSACTION_TYPES = [
  { value: 'sale', label: 'Vente',    desc: 'Vendre votre bien',     Icon: IconVente },
  { value: 'rent', label: 'Location', desc: 'Mettre en location',    Icon: IconLocation },
] as const

const PROPERTY_TYPES = [
  { value: 'apartment',  label: 'Appartement', Icon: IconApartment },
  { value: 'villa',      label: 'Villa',       Icon: IconVilla },
  { value: 'house',      label: 'Maison',      Icon: IconHouse },
  { value: 'land',       label: 'Terrain',     Icon: IconLand },
  { value: 'commercial', label: 'Commercial',  Icon: IconCommercial },
  { value: 'office',     label: 'Bureau',      Icon: IconOffice },
] as const

interface Props {
  form: UseFormReturn<WizardSchema>
}

// ── Component ─────────────────────────────────────────────────────────────────

export function Step1Type({ form }: Props) {
  const { watch, setValue, formState: { errors } } = form
  const transactionType = watch('transactionType')
  const propertyType    = watch('propertyType')

  return (
    <div className="space-y-6">
      {/* Transaction type */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
          Type de transaction
        </p>
        <div className="grid grid-cols-2 gap-3">
          {TRANSACTION_TYPES.map((t) => {
            const active = transactionType === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setValue('transactionType', t.value, { shouldValidate: true })}
                className="p-4 text-left transition-all duration-150 border-2 relative overflow-hidden"
                style={{
                  borderRadius: '3px',
                  borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                  background:  active ? 'var(--color-primary)' : 'var(--color-surface)',
                }}
              >
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--color-accent)' }} />
                )}
                <div className="flex items-center gap-2.5">
                  <div className="shrink-0" style={{ color: active ? 'white' : 'var(--color-primary)' }}>
                    <t.Icon />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: active ? 'white' : 'var(--color-text)' }}>
                      {t.label}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: active ? 'oklch(90% 0 0 / 0.7)' : 'var(--color-muted)' }}>
                      {t.desc}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
        {errors.transactionType && (
          <p className="text-xs mt-1.5" style={{ color: 'oklch(55% 0.18 25)' }}>{errors.transactionType.message}</p>
        )}
      </div>

      {/* Property type */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--color-muted)' }}>
          Catégorie du bien
        </p>
        <div className="grid grid-cols-3 gap-2.5">
          {PROPERTY_TYPES.map((t) => {
            const active = propertyType === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setValue('propertyType', t.value, { shouldValidate: true })}
                className="p-3.5 flex flex-col items-center gap-2.5 transition-all duration-150 border-2"
                style={{
                  borderRadius: '3px',
                  borderColor: active ? 'var(--color-primary)' : 'var(--color-border)',
                  background:  active ? 'oklch(42% 0.09 155 / 0.06)' : 'var(--color-surface)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{
                    background: active ? 'oklch(42% 0.09 155 / 0.12)' : 'var(--color-bg)',
                    color: active ? 'var(--color-primary)' : 'var(--color-muted)',
                  }}
                >
                  <t.Icon />
                </div>
                <span className="text-xs font-semibold leading-tight text-center" style={{ color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}>
                  {t.label}
                </span>
              </button>
            )
          })}
        </div>
        {errors.propertyType && (
          <p className="text-xs mt-1.5" style={{ color: 'oklch(55% 0.18 25)' }}>{errors.propertyType.message}</p>
        )}
      </div>
    </div>
  )
}
