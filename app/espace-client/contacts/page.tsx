const MOCK_CONTACTS = [
  {
    id: '1',
    requester: 'Sarra Mansouri',
    phone: '+216 55 123 456',
    property: 'Appartement lumineux au centre-ville',
    message: 'Bonjour, est-ce que le bien est toujours disponible ? Je voudrais organiser une visite ce week-end.',
    date: '17 Avr 2026',
    read: false,
  },
  {
    id: '2',
    requester: 'Karim Jebali',
    phone: '+216 98 765 432',
    property: 'Villa avec jardin privé',
    message: "Je suis très intéressé par votre villa. Pouvez-vous me donner plus d'informations sur la superficie du jardin ?",
    date: '16 Avr 2026',
    read: true,
  },
  {
    id: '3',
    requester: 'Nour Trabelsi',
    phone: '+216 22 333 444',
    property: 'Studio moderne à Sousse',
    message: 'Le studio est-il disponible à partir du 1er mai ?',
    date: '15 Avr 2026',
    read: true,
  },
]

export default function ContactsPage() {
  const unread = MOCK_CONTACTS.filter((c) => !c.read).length

  return (
    <main className="flex-1 px-6 py-8 max-w-3xl w-full">
      <div className="mb-6">
        <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--color-text)' }}>
          Demandes de contact
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {MOCK_CONTACTS.length} message{MOCK_CONTACTS.length !== 1 ? 's' : ''}
          {unread > 0 && (
            <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'oklch(42% 0.09 155 / 0.1)', color: 'var(--color-primary)' }}>
              {unread} non lu{unread > 1 ? 's' : ''}
            </span>
          )}
        </p>
      </div>

      {MOCK_CONTACTS.length === 0 ? (
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
          {MOCK_CONTACTS.map((c) => (
            <div key={c.id}
              className="p-5 rounded-2xl transition-shadow"
              style={{
                background: 'var(--color-surface)',
                border: `1px solid ${c.read ? 'var(--color-border)' : 'oklch(42% 0.09 155 / 0.3)'}`,
                boxShadow: c.read ? 'none' : '0 0 0 1px oklch(42% 0.09 155 / 0.15)',
              }}>
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-sm"
                    style={{ background: 'oklch(42% 0.09 155 / 0.1)', color: 'var(--color-primary)' }}>
                    {c.requester[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-none" style={{ color: 'var(--color-text)' }}>
                      {c.requester}
                      {!c.read && (
                        <span className="ml-2 inline-block w-2 h-2 rounded-full align-middle" style={{ background: 'var(--color-primary)' }} />
                      )}
                    </p>
                    <a href={`tel:${c.phone}`} className="text-xs mt-0.5 block" style={{ color: 'var(--color-primary)' }}>
                      {c.phone}
                    </a>
                  </div>
                </div>
                <p className="text-xs shrink-0 ml-4" style={{ color: 'var(--color-muted)' }}>{c.date}</p>
              </div>

              {/* Property context */}
              <p className="text-xs mb-2 font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                Re : {c.property}
              </p>

              {/* Message */}
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text)' }}>
                {c.message}
              </p>

              {/* Reply actions */}
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
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
