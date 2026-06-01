'use client'

const SESSION_KEY = 'sakan_session_token'

export function getSessionToken(): string | undefined {
  if (typeof sessionStorage === 'undefined') return undefined
  return sessionStorage.getItem(SESSION_KEY) ?? undefined
}

export function setSessionToken(value: string): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.setItem(SESSION_KEY, value)
}

export function clearSessionToken(): void {
  if (typeof sessionStorage === 'undefined') return
  sessionStorage.removeItem(SESSION_KEY)
}
