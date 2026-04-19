'use client'

import { useEffect, useState } from 'react'
import { propertiesApi, type Contact } from '@/lib/api'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-TN', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    propertiesApi.myContacts()
      .then((res) => setContacts(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="flex-1 px-6 py-8 max-w-3xl w-full">
      <div className="mb-6">
        <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--color-text)' }}>
          Demandes de contact
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {contacts.length} message{contacts.length !== 1 ? 's' : ''}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">💬</p>
          <p className="font-display font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
            Aucune demande pour l'instant
          </p>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Les visiteurs intéressés par vos biens vous contacteront ici.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map((c) => (
            <div key={c.id}
              className="p-5 rounded-2xl"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-sm"
                    style={{ background: 'oklch(42% 0.09 155 / 0.1)', color: 'var(--color-primary)' }}>
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-none" style={{ color: 'var(--color-text)' }}>
                      {c.name}
                    </p>
                    {c.phone && (
                      <a href={`tel:${c.phone}`} className="text-xs mt-0.5 block" style={{ color: 'var(--color-primary)' }}>
                        {c.phone}
                      </a>
                    )}
                  </div>
                </div>
                <p className="text-xs shrink-0 ml-4" style={{ color: 'var(--color-muted)' }}>
                  {formatDate(c.created_at)}
                </p>
              </div>

              {c.property && (
                <p className="text-xs mb-2 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                  Re : {c.property.title}
                </p>
              )}

              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                {c.message}
              </p>

              {c.phone && (
                <div className="flex gap-2 mt-4">
                  <a href={`tel:${c.phone}`}
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center border transition-colors"
                    style={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}>
                    Appeler
                  </a>
                  <a href={`https://wa.me/${c.phone.replace(/\s/g, '').replace('+', '')}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-center text-white"
                    style={{ background: '#25D366' }}>
                    WhatsApp
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
