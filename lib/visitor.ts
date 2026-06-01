'use client'

const COOKIE_NAME = 'visitor_key'
const COOKIE_TTL_DAYS = 365

export function getVisitorKey(): string | undefined {
  if (typeof document === 'undefined') return undefined
  const match = document.cookie.split(';').find(c => c.trim().startsWith(`${COOKIE_NAME}=`))
  return match?.split('=')[1]?.trim()
}

export function setVisitorKey(value: string): void {
  if (typeof document === 'undefined') return
  const expires = new Date(Date.now() + COOKIE_TTL_DAYS * 86400 * 1000).toUTCString()
  document.cookie = `${COOKIE_NAME}=${value}; expires=${expires}; path=/; SameSite=Lax`
}
