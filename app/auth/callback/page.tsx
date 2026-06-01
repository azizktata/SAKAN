'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'

export default function AuthCallbackPage() {
  const { setUser } = useAuth()
  const router      = useRouter()

  useEffect(() => {
    authApi.me()
      .then((res) => {
        setUser(res.data)
        window.location.href = '/espace-client'
      })
      .catch(() => {
        router.replace('/auth')
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-bg)' }}>
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
    </div>
  )
}
