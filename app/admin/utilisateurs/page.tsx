'use client'

import { useState, useEffect } from 'react'
import { adminApi, type User, type UserRole } from '@/lib/api'

const ROLE_META: Record<UserRole, { label: string; color: string; bg: string }> = {
  admin:       { label: 'Admin',      color: 'oklch(42% 0.09 155)', bg: 'oklch(42% 0.09 155 / 0.08)' },
  agent:       { label: 'Agent',      color: 'oklch(60% 0.1 78)',   bg: 'oklch(68% 0.1 78 / 0.1)' },
  particulier: { label: 'Particulier', color: 'var(--color-text-secondary)', bg: 'oklch(42% 0.009 155 / 0.06)' },
}

export default function AdminUtilisateursPage() {
  const [users, setUsers]     = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.users()
      .then((res) => setUsers(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function cycleRole(id: string, currentRole: UserRole) {
    const next: Record<UserRole, UserRole> = {
      particulier: 'agent',
      agent:       'admin',
      admin:       'particulier',
    }
    const newRole = next[currentRole]
    adminApi.updateUser(id, { role: newRole }).catch(() => {})
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: newRole } : u))
  }

  return (
    <main className="flex-1 px-6 py-8 max-w-4xl w-full">
      <div className="mb-6">
        <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--color-text)' }}>
          Utilisateurs
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
          {users.length} comptes enregistrés
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden border" style={{ borderColor: 'var(--color-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--color-bg)' }}>
                {['Utilisateur', 'Email', 'Rôle', 'Inscrit', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider"
                    style={{ color: 'var(--color-muted)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ background: 'var(--color-surface)' }}>
              {users.map((u, i) => {
                const r = ROLE_META[u.role] ?? ROLE_META.particulier
                return (
                  <tr key={u.id} style={{ borderTop: i > 0 ? '1px solid var(--color-border)' : 'none' }}>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 text-sm font-bold"
                          style={{ background: 'oklch(42% 0.09 155 / 0.1)', color: 'var(--color-primary)' }}>
                          {u.image
                            ? <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                            : u.name[0].toUpperCase()
                          }
                        </div>
                        <p className="font-medium" style={{ color: 'var(--color-text)' }}>{u.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{u.email}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                        style={{ color: r.color, background: r.bg }}>
                        {r.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--color-muted)' }}>—</td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => cycleRole(u.id, u.role)}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
                        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                        Changer rôle
                      </button>
                    </td>
                  </tr>
                )
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--color-muted)' }}>
                    Aucun utilisateur.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
