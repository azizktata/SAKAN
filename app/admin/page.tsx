import { StatsCard } from '@/components/espace-client/stats-card'

const MOCK_STATS = { total: 128, published: 94, pending: 12, users: 340 }

const MOCK_RECENT = [
  { id: '1', title: 'Villa El Menzah',        owner: 'Ahmed B.',  type: 'Villa',        status: 'pending',   date: '17 Avr 2026' },
  { id: '2', title: 'Appartement Lac 1',      owner: 'Sarra M.',  type: 'Appartement',  status: 'published', date: '17 Avr 2026' },
  { id: '3', title: 'Terrain à Hammamet',     owner: 'Karim J.',  type: 'Terrain',      status: 'pending',   date: '16 Avr 2026' },
  { id: '4', title: 'Bureau route de Sfax',   owner: 'Nour T.',   type: 'Bureau',       status: 'published', date: '16 Avr 2026' },
]

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: 'Publié',    color: 'var(--color-primary)',        bg: 'oklch(42% 0.09 155 / 0.08)' },
  pending:   { label: 'En attente', color: 'oklch(60% 0.1 78)',          bg: 'oklch(68% 0.1 78 / 0.1)'  },
  draft:     { label: 'Brouillon', color: 'var(--color-text-secondary)', bg: 'oklch(42% 0.009 155 / 0.06)' },
}

export default function AdminPage() {
  return (
    <main className="flex-1 px-6 py-8 max-w-4xl w-full">
      <div className="mb-8">
        <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--color-text)' }}>
          Tableau de bord
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          Vue d'ensemble de la plateforme SAKAN.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total annonces"   value={MOCK_STATS.total}     />
        <StatsCard label="Publiées"         value={MOCK_STATS.published} />
        <StatsCard label="En attente"       value={MOCK_STATS.pending}   color="oklch(60% 0.1 78)" />
        <StatsCard label="Utilisateurs"     value={MOCK_STATS.users}     color="var(--color-accent)" />
      </div>

      {/* Recent activity */}
      <section>
        <h2 className="font-display font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
          Activité récente
        </h2>
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-bg)' }}>
                {['Bien', 'Propriétaire', 'Type', 'Statut', 'Date'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--color-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ background: 'var(--color-surface)' }}>
              {MOCK_RECENT.map((row, i) => {
                const s = STATUS_META[row.status] ?? STATUS_META.draft
                return (
                  <tr key={row.id} style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : 'none' }}>
                    <td className="px-4 py-3.5 font-medium truncate max-w-[200px]" style={{ color: 'var(--color-text)' }}>
                      {row.title}
                    </td>
                    <td className="px-4 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{row.owner}</td>
                    <td className="px-4 py-3.5" style={{ color: 'var(--color-text-secondary)' }}>{row.type}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ color: s.color, background: s.bg }}>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--color-muted)' }}>{row.date}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  )
}
