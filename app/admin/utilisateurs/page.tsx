'use client'

import { useState } from 'react'

type Role = 'CLIENT' | 'ADMIN'
type User = { id: string; name: string; email: string; role: Role; listings: number; joined: string }

const MOCK_USERS: User[] = [
  { id: '1', name: 'Ahmed Ben Ali',  email: 'ahmed@gmail.com',  role: 'CLIENT', listings: 3, joined: 'Jan 2026' },
  { id: '2', name: 'Sarra Mansouri', email: 'sarra@gmail.com',  role: 'CLIENT', listings: 1, joined: 'Fév 2026' },
  { id: '3', name: 'Karim Jebali',   email: 'karim@gmail.com',  role: 'ADMIN',  listings: 0, joined: 'Mar 2026' },
  { id: '4', name: 'Nour Trabelsi',  email: 'nour@gmail.com',   role: 'CLIENT', listings: 2, joined: 'Avr 2026' },
  { id: '5', name: 'Mehdi Haddad',   email: 'mehdi@gmail.com',  role: 'CLIENT', listings: 1, joined: 'Avr 2026' },
]

export default function AdminUtilisateursPage() {
  const [users, setUsers] = useState<User[]>(MOCK_USERS)

  function toggleRole(id: string) {
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: u.role === 'ADMIN' ? 'CLIENT' : 'ADMIN' } : u))
  }

  return (
    <main className="flex-1 px-6 py-8 max-w-4xl w-full">
      <div className="mb-6">
        <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--color-text)' }}>Utilisateurs</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>{users.length} comptes enregistrés</p>
      </div>

      <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: 'var(--color-bg)' }}>
              {['Utilisateur', 'Email', 'Rôle', 'Annonces', 'Inscrit', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: 'var(--color-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ background: 'var(--color-surface)' }}>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : 'none' }}>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0"
                      style={{ background: 'oklch(42% 0.09 155 / 0.1)', color: 'var(--color-primary)' }}>
                      {u.name[0]}
                    </div>
                    <span className="font-medium" style={{ color: 'var(--color-text)' }}>{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{u.email}</td>
                <td className="px-4 py-3.5">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{
                      color:       u.role === 'ADMIN' ? 'oklch(35% 0.05 155)' : 'var(--color-text-secondary)',
                      background:  u.role === 'ADMIN' ? 'oklch(42% 0.09 155 / 0.12)' : 'oklch(42% 0.009 155 / 0.06)',
                    }}>
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-xs tabular-nums" style={{ color: 'var(--color-text-secondary)' }}>
                  {u.listings}
                </td>
                <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--color-muted)' }}>{u.joined}</td>
                <td className="px-4 py-3.5">
                  <button onClick={() => toggleRole(u.id)}
                    className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                    {u.role === 'ADMIN' ? '→ Client' : '→ Admin'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
