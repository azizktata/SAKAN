'use client'

import { useState, useEffect, useCallback } from 'react'
import { adminApi, type User, type UserRole, type AdminCreateUserPayload } from '@/lib/api'

const ROLE_META: Record<UserRole, { label: string; color: string; bg: string }> = {
  admin:       { label: 'Admin',       color: 'oklch(42% 0.09 155)',      bg: 'oklch(42% 0.09 155 / 0.08)' },
  agent:       { label: 'Agent',       color: 'oklch(60% 0.1 78)',        bg: 'oklch(68% 0.1 78 / 0.1)' },
  particulier: { label: 'Particulier', color: 'var(--color-text-secondary)', bg: 'oklch(42% 0.009 155 / 0.06)' },
}

const ROLES: UserRole[] = ['particulier', 'agent', 'admin']

const PER_PAGE = 20

export default function AdminUtilisateursPage() {
  const [users, setUsers]           = useState<User[]>([])
  const [total, setTotal]           = useState(0)
  const [lastPage, setLastPage]     = useState(1)
  const [page, setPage]             = useState(1)
  const [search, setSearch]         = useState('')
  const [debouncedSearch, setDebounced] = useState('')
  const [loading, setLoading]       = useState(true)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [changingRole, setChangingRole]   = useState<string | null>(null)
  const [showCreate, setShowCreate]       = useState(false)
  const [creating, setCreating]           = useState(false)
  const [createError, setCreateError]     = useState<string | null>(null)
  const [newUser, setNewUser]             = useState<AdminCreateUserPayload>({
    name: '', email: '', password: '', role: 'particulier',
  })

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(() => {
    setLoading(true)
    adminApi.users({ page, per_page: PER_PAGE, search: debouncedSearch || undefined })
      .then((r) => {
        setUsers(r.data.data)
        setTotal(r.data.total)
        setLastPage(r.data.last_page)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [page, debouncedSearch])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [debouncedSearch])

  function handleRoleChange(id: string, newRole: UserRole) {
    adminApi.updateUser(id, { role: newRole }).catch(() => {})
    setUsers((prev) => prev.map((u) => u.id === id ? { ...u, role: newRole } : u))
    setChangingRole(null)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    setCreateError(null)
    try {
      const res = await adminApi.createUser(newUser)
      setUsers((prev) => [res.data, ...prev])
      setTotal((t) => t + 1)
      setShowCreate(false)
      setNewUser({ name: '', email: '', password: '', role: 'particulier' })
    } catch {
      setCreateError('Erreur lors de la création. Cet email est peut-être déjà utilisé.')
    } finally {
      setCreating(false)
    }
  }

  function handleDelete(id: string) {
    adminApi.deleteUser(id).catch(() => {})
    setUsers((prev) => prev.filter((u) => u.id !== id))
    setTotal((t) => t - 1)
    setConfirmDelete(null)
  }

  return (
    <main className="flex-1 px-6 py-8 max-w-5xl w-full">
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-semibold text-2xl" style={{ color: 'var(--color-text)' }}>
            Utilisateurs
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
            {total} compte{total !== 1 ? 's' : ''} enregistré{total !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--color-primary)' }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel utilisateur
        </button>
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--color-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
          </svg>
          <input
            type="text"
            placeholder="Nom ou email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 w-56"
            style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <>
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
                              // eslint-disable-next-line @next/next/no-img-element
                              ? <img src={u.image} alt={u.name} className="w-full h-full object-cover" />
                              : u.name[0]?.toUpperCase()
                            }
                          </div>
                          <p className="font-medium" style={{ color: 'var(--color-text)' }}>{u.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--color-text-secondary)' }}>{u.email}</td>
                      <td className="px-4 py-3.5">
                        {changingRole === u.id ? (
                          <div className="flex items-center gap-1.5">
                            <div className="relative">
                              <select
                                defaultValue={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                                className="appearance-none text-xs font-semibold px-3 py-1.5 pr-7 rounded-lg border focus:outline-none"
                                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                                autoFocus
                              >
                                {ROLES.map((role) => (
                                  <option key={role} value={role}>{ROLE_META[role].label}</option>
                                ))}
                              </select>
                            </div>
                            <button onClick={() => setChangingRole(null)}
                              className="text-xs px-2 py-1.5 rounded-lg border"
                              style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)' }}>
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setChangingRole(u.id)}>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full cursor-pointer transition-opacity hover:opacity-70"
                              style={{ color: r.color, background: r.bg }}>
                              {r.label}
                            </span>
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-xs" style={{ color: 'var(--color-muted)' }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('fr-TN') : '—'}
                      </td>
                      <td className="px-4 py-3.5">
                        {confirmDelete === u.id ? (
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => handleDelete(u.id)}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
                              style={{ background: 'oklch(50% 0.18 25)' }}>
                              Confirmer
                            </button>
                            <button onClick={() => setConfirmDelete(null)}
                              className="text-xs font-medium px-3 py-1.5 rounded-lg border"
                              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmDelete(u.id)}
                            className="text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors"
                            style={{ borderColor: 'var(--color-border)', color: 'oklch(50% 0.15 25)' }}>
                            Supprimer
                          </button>
                        )}
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

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-xs" style={{ color: 'var(--color-muted)' }}>
                Page {page} sur {lastPage}
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-40"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  Précédent
                </button>
                <button
                  disabled={page >= lastPage}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border transition-colors disabled:opacity-40"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  Suivant
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {/* Create user modal */}
      {showCreate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={() => setShowCreate(false)}
        >
          <div
            className="w-full max-w-md rounded-3xl p-7 shadow-2xl"
            style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-lg" style={{ color: 'var(--color-text)' }}>
                Nouvel utilisateur
              </h2>
              <button onClick={() => setShowCreate(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ color: 'var(--color-muted)' }}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  Nom complet
                </label>
                <input
                  type="text" required
                  value={newUser.name}
                  onChange={(e) => setNewUser((u) => ({ ...u, name: e.target.value }))}
                  placeholder="Prénom Nom"
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  Email
                </label>
                <input
                  type="email" required
                  value={newUser.email}
                  onChange={(e) => setNewUser((u) => ({ ...u, email: e.target.value }))}
                  placeholder="email@exemple.com"
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  Mot de passe
                </label>
                <input
                  type="password" required minLength={8}
                  value={newUser.password}
                  onChange={(e) => setNewUser((u) => ({ ...u, password: e.target.value }))}
                  placeholder="8 caractères minimum"
                  className="w-full rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: 'var(--color-muted)' }}>
                  Rôle
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser((u) => ({ ...u, role: e.target.value as UserRole }))}
                  className="w-full appearance-none rounded-xl border px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2"
                  style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)' }}
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>{ROLE_META[r].label}</option>
                  ))}
                </select>
              </div>

              {createError && (
                <p className="text-xs" style={{ color: 'oklch(55% 0.18 25)' }}>{createError}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold border transition-colors"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
                  Annuler
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'var(--color-primary)' }}>
                  {creating ? 'Création…' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
