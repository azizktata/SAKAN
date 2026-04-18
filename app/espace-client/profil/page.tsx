'use client'

import { useState } from 'react'

export default function ProfilPage() {
  const [name, setName]   = useState('Ahmed Ben Ali')
  const [phone, setPhone] = useState('+216 55 123 456')
  const [saved, setSaved] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <main className="flex-1 px-6 py-8 max-w-xl w-full">
      <div className="mb-6">
        <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--color-text)' }}>
          Mon profil
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Modifiez vos informations personnelles.
        </p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8 p-5 rounded-2xl" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center font-display font-bold text-2xl shrink-0"
          style={{ background: 'oklch(42% 0.09 155 / 0.1)', color: 'var(--color-primary)' }}>
          A
        </div>
        <div>
          <p className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>{name}</p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
            Photo depuis Google — modifiable depuis votre compte Google.
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="prof-name" className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-muted)' }}>
            Nom complet
          </label>
          <input
            id="prof-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          />
        </div>

        <div>
          <label htmlFor="prof-email" className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-muted)' }}>
            Email
          </label>
          <input
            id="prof-email"
            type="email"
            value="ahmed.benali@gmail.com"
            disabled
            className="w-full rounded-xl border px-4 py-3 text-sm cursor-not-allowed"
            style={{ borderColor: 'var(--color-border)', background: 'oklch(96% 0.005 155)', color: 'var(--color-muted)' }}
          />
          <p className="text-xs mt-1.5" style={{ color: 'var(--color-muted)' }}>
            L'email est lié à votre compte Google et ne peut pas être modifié.
          </p>
        </div>

        <div>
          <label htmlFor="prof-phone" className="text-xs font-semibold uppercase tracking-wider block mb-2" style={{ color: 'var(--color-muted)' }}>
            Téléphone
          </label>
          <input
            id="prof-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+216 XX XXX XXX"
            className="w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit"
            className="px-6 py-3 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--color-primary)' }}>
            Enregistrer
          </button>
          {saved && (
            <p className="text-sm font-medium" style={{ color: 'var(--color-primary)' }}>
              Modifications sauvegardées ✓
            </p>
          )}
        </div>
      </form>
    </main>
  )
}
