'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { authApi, type User } from '@/lib/api'

type AuthContextType = {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  refresh: () => Promise<void>
  setUser: (user: User | null) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: async () => {},
  refresh: async () => {},
  setUser: () => {},
})

const LS_KEY = 'sakan_user'

function readLocalUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  } catch {
    return null
  }
}

function writeLocalUser(user: User | null) {
  if (typeof window === 'undefined') return
  if (user) {
    localStorage.setItem(LS_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(LS_KEY)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,    setUserState] = useState<User | null>(readLocalUser)
  const [loading, setLoading]   = useState(true)

  function setUser(u: User | null) {
    setUserState(u)
    writeLocalUser(u)
  }

  async function fetchMe() {
    try {
      const res = await authApi.me()
      setUser(res.data)
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 401) {
        // Definite session expiry — clear everything
        setUser(null)
        document.cookie = 'sakan_token=; path=/; max-age=0'
      }
      // Network/CORS errors: keep the localStorage user intact
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const logout = async () => {
    try { await authApi.logout() } catch { /* swallow */ }
    setUser(null)
    document.cookie = 'sakan_token=; path=/; max-age=0'
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout, refresh: fetchMe, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
