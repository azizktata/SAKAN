'use client'

import { useEffect, useRef } from 'react'
import { sessionApi } from '@/lib/api'
import { getVisitorKey } from '@/lib/visitor'
import { getSessionToken, setSessionToken, clearSessionToken } from '@/lib/session'

function detectDevice(): 'mobile' | 'desktop' | 'tablet' | 'unknown' {
  if (typeof navigator === 'undefined') return 'unknown'
  const ua = navigator.userAgent
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet'
  if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile'
  return 'desktop'
}

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const sessionTokenRef = useRef<string | undefined>(undefined)
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const visitorKey = getVisitorKey()
    if (!visitorKey) return

    // Check if we already have an active session token in sessionStorage
    const existingToken = getSessionToken()
    if (existingToken) {
      sessionTokenRef.current = existingToken
    }

    sessionApi.start({
      visitor_key: visitorKey,
      entry_page: window.location.pathname,
      device: detectDevice(),
    }).then(res => {
      const token = res.data.session_token
      setSessionToken(token)
      sessionTokenRef.current = token
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const token = sessionTokenRef.current
      if (token) {
        sessionApi.ping(token).catch(() => {})
      }
    }, 60_000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handleEnd = () => {
      const token = sessionTokenRef.current
      if (token) {
        sessionApi.end(token).catch(() => {})
        clearSessionToken()
        sessionTokenRef.current = undefined
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleEnd()
      }
    }

    window.addEventListener('beforeunload', handleEnd)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleEnd)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return <>{children}</>
}
