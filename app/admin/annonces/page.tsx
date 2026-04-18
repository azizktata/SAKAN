'use client'

import { useState } from 'react'

type Status = 'all' | 'published' | 'pending' | 'draft'

type Row = {
  id: string; title: string; owner: string; type: string
  price: number; mode: 'vente' | 'location'; status: string; date: string
}

const ALL_ROWS: Row[] = [
  { id: '1', title: 'Appartement lumineux centre-ville', owner: 'Ahmed Ben Ali',  type: 'Appartement', price: 285000, mode: 'vente',    status: 'published', date: '17 Avr' },
  { id: '2', title: 'Villa El Menzah 6',                 owner: 'Sarra Mansouri', type: 'Villa',       price: 950000, mode: 'vente',    status: 'pending',   date: '17 Avr' },
  { id: '3', title: 'Terrain à Hammamet',                owner: 'Karim Jebali',   type: 'Terrain',     price: 180000, mode: 'vente',    status: 'pending',   date: '16 Avr' },
  { id: '4', title: 'Studio Lac 1',                      owner: 'Nour Trabelsi',  type: 'Appartement', price: 1400,   mode: 'location', status: 'published', date: '15 Avr' },
  { id: '5', title: 'Bureau route de Sfax',              owner: 'Mehdi Haddad',   type: 'Bureau',      price: 2200,   mode: 'location', status: 'draft',     date: '14 Avr' },
]

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  published: { label: 'Publié',     color: 'var(--color-primary)',        bg: 'oklch(42% 0.09 155 / 0.08)' },
  pending:   { label: 'En attente', color: 'oklch(60% 0.1 78)',           bg: 'oklch(68% 0.1 78 / 0.1)' },
  draft:     { label: 'Brouillon',  color: 'var(--color-text-secondary)', bg: 'oklch(42% 0.009 155 / 0.06)' },
}

function fmt(n: number) { return n.toLocaleString('fr-TN') }

const FILTERS: { value: Status; label: string }[] = [
  { value: 'all',       label: 'Tout' },
  { value: 'published', label: 'Publiés' },
  { value: 'pending',   label: 'En attente' },
  { value: 'draft',     label: 'Brouillons' },
]

export default function AdminAnnoncesPage() {
  const [filter, setFilter] = useState<Status>('all')
  const [rows, setRows]     = useState<Row[]>(ALL_ROWS)

  const visible = filter === 'all' ? rows : rows.filter((r) => r.status === filter)

  function approve(id: string) {
    setRows((prev) => prev.map((r) => r.id === id ? { ...r, status: 'published' } : r))
  }

  function remove(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <main className="flex-1 px-6 py-8 max-w-5xl w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--color-text)' }}>Annonces</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{rows.length} biens au total</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {FILTERS.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors border"
            style={{
              borderColor: filter === f.value ? 'var(--color-primary)' : 'var(--color-border)',
              background:  filter === f.value ? 'oklch(42% 0.09 155 / 0.08)' : 'transparent',
              color:       filter === f.value ? 'var(--color-primary)' : 'var(--color-text-secondary)',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--color-bg)' }}>
              {['Bien', 'Propriétaire', 'Prix', 'Statut', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ background: 'var(--color-surface)' }}>
            {visible.map((row, i) => {
              const s = STATUS_META[row.status] ?? STATUS_META.draft
              return (
                <tr key={row.id} style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : 'none' }}>
                  <td className="px-4 py-3.5">
                    <p className="font-medium truncate max-w-[200px]" style={{ color: 'var(--color-text)' }}>{row.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>{row.type} · {row.mode === 'vente' ? 'Vente' : 'Location'}</p>
                  </td>
                  <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{row.owner}</td>
                  <td className="px-4 py-3.5 font-display font-semibold tabular-nums text-xs" style={{ color: 'var(--color-text)' }}>
                    {fmt(row.price)}{row.mode === 'location' ? ' DT/m' : ' DT'}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ color: s.color, background: s.bg }}>
                      {s.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      {row.status === 'pending' && (
                        <button onClick={() => approve(row.id)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-80"
                          style={{ background: 'var(--color-primary)' }}>
                          Approuver
                        </button>
                      )}
                      <button onClick={() => remove(row.id)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
                        style={{ borderColor: 'var(--color-border)', color: 'oklch(50% 0.15 25)' }}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </main>
  )
}
