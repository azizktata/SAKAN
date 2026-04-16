'use client'

import Link from 'next/link'
import { useEffect, useState, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Vente',    href: '/logements?mode=vente',    mode: 'vente'    },
  { label: 'Location', href: '/logements?mode=location', mode: 'location' },
]

// ── Active-aware nav links (needs Suspense because of useSearchParams) ────────

function NavLinksInner({ scrolled }: { scrolled: boolean }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentMode = searchParams.get('mode')

  return (
    <>
      {NAV_LINKS.map(({ label, href, mode }) => {
        const isActive = pathname === '/logements' && currentMode === mode
        const activeColor   = scrolled ? 'var(--color-primary)' : 'white'
        const inactiveColor = scrolled ? 'var(--color-text-secondary)' : 'rgba(255,255,255,0.72)'

        return (
          <Link
            key={href}
            href={href}
            className="text-sm transition-colors duration-200"
            style={{
              color: isActive ? activeColor : inactiveColor,
              fontWeight: isActive ? 600 : 500,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = scrolled ? 'var(--color-text)' : 'white')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = isActive ? activeColor : inactiveColor)
            }
          >
            {label}
          </Link>
        )
      })}
    </>
  )
}

// Fallback: links without active state (shown during Suspense hydration)
function NavLinksFallback({ scrolled }: { scrolled: boolean }) {
  return (
    <>
      {NAV_LINKS.map(({ label, href }) => (
        <Link
          key={href}
          href={href}
          className="text-sm font-medium transition-colors duration-200"
          style={{ color: scrolled ? 'var(--color-text-secondary)' : 'rgba(255,255,255,0.72)' }}
        >
          {label}
        </Link>
      ))}
    </>
  )
}

// ── Navbar ────────────────────────────────────────────────────────────────────

interface NavbarProps {
  /** Start transparent with white text (landing hero). Switches to white bg on scroll. */
  initialDark?: boolean
}

export function Navbar({ initialDark = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(!initialDark)

  useEffect(() => {
    if (!initialDark) return
    const onScroll = () => setScrolled(window.scrollY > 72)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [initialDark])

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 transition-all duration-300"
      style={
        scrolled
          ? { background: 'var(--color-surface)', boxShadow: '0 1px 0 var(--color-border)' }
          : { background: 'transparent' }
      }
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span
            className="font-display font-semibold text-lg tracking-tight transition-colors duration-300"
            style={{ color: scrolled ? 'var(--color-text)' : 'white' }}
          >
            SAKAN
          </span>
        </Link>

        {/* Right side: nav links + CTAs */}
        <div className="hidden md:flex items-center gap-6">
          <Suspense fallback={<NavLinksFallback scrolled={scrolled} />}>
            <NavLinksInner scrolled={scrolled} />
          </Suspense>

          {/* Divider */}
          <span className="w-px h-4 rounded" style={{
            background: scrolled ? 'var(--color-border)' : 'rgba(255,255,255,0.2)',
          }} aria-hidden="true" />

          <Link
            href="/auth"
            className="text-sm transition-colors duration-200"
            style={{ color: scrolled ? 'var(--color-text-secondary)' : 'rgba(255,255,255,0.62)', fontWeight: 500 }}
          >
            Se connecter
          </Link>

          <Link
            href="/publier"
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
            style={
              scrolled
                ? { background: 'var(--color-primary)', color: 'white' }
                : { background: 'white', color: 'var(--color-primary-dark)' }
            }
          >
            Publier un bien
          </Link>
        </div>

        {/* Mobile: just the publish button */}
        <div className="flex md:hidden">
          <Link
            href="/publier"
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
            style={
              scrolled
                ? { background: 'var(--color-primary)', color: 'white' }
                : { background: 'white', color: 'var(--color-primary-dark)' }
            }
          >
            Publier
          </Link>
        </div>
      </nav>
    </header>
  )
}
