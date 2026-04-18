'use client'

import Link from 'next/link'
import { useEffect, useState, Suspense, useRef } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'

const NAV_LINKS = [
  { label: 'Vente',    href: '/logements?mode=vente',    mode: 'vente'    },
  { label: 'Location', href: '/logements?mode=location', mode: 'location' },
]

// ── Fake session type (replace with useSession() from next-auth/react in Round 2) ──

type FakeUser = { name: string; image: string | null; role: 'CLIENT' | 'ADMIN' } | null
const MOCK_USER: FakeUser = null // set to an object to preview logged-in state

// ── Active-aware nav links ─────────────────────────────────────────────────────

function NavLinksInner({ scrolled }: { scrolled: boolean }) {
  const pathname     = usePathname()
  const searchParams = useSearchParams()
  const currentMode  = searchParams.get('mode')

  return (
    <>
      {NAV_LINKS.map(({ label, href, mode }) => {
        const isActive      = pathname === '/logements' && currentMode === mode
        const activeColor   = scrolled ? 'var(--color-primary)' : 'white'
        const inactiveColor = scrolled ? 'var(--color-text-secondary)' : 'rgba(255,255,255,0.72)'
        return (
          <Link
            key={href}
            href={href}
            className="text-sm transition-colors duration-200"
            style={{ color: isActive ? activeColor : inactiveColor, fontWeight: isActive ? 600 : 500 }}
            onMouseEnter={(e) => (e.currentTarget.style.color = scrolled ? 'var(--color-text)' : 'white')}
            onMouseLeave={(e) => (e.currentTarget.style.color = isActive ? activeColor : inactiveColor)}
          >
            {label}
          </Link>
        )
      })}
    </>
  )
}

function NavLinksFallback({ scrolled }: { scrolled: boolean }) {
  return (
    <>
      {NAV_LINKS.map(({ label, href }) => (
        <Link key={href} href={href} className="text-sm font-medium"
          style={{ color: scrolled ? 'var(--color-text-secondary)' : 'rgba(255,255,255,0.72)' }}>
          {label}
        </Link>
      ))}
    </>
  )
}

// ── Publish button (opens dialog via ?publish=open) ───────────────────────────

function PublishButton({ scrolled }: { scrolled: boolean }) {
  const router   = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function open() {
    const params = new URLSearchParams(searchParams.toString())
    params.set('publish', 'open')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <button
      onClick={open}
      className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
      style={scrolled
        ? { background: 'var(--color-primary)', color: 'white' }
        : { background: 'white', color: 'var(--color-primary-dark)' }}
    >
      Publier un bien
    </button>
  )
}

function PublishButtonMobile({ scrolled }: { scrolled: boolean }) {
  const router   = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function open() {
    const params = new URLSearchParams(searchParams.toString())
    params.set('publish', 'open')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <button
      onClick={open}
      className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
      style={scrolled
        ? { background: 'var(--color-primary)', color: 'white' }
        : { background: 'white', color: 'var(--color-primary-dark)' }}
    >
      Publier
    </button>
  )
}

// ── User avatar dropdown (logged-in state) ────────────────────────────────────

function UserMenu({ user, scrolled }: { user: NonNullable<FakeUser>; scrolled: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const textColor = scrolled ? 'var(--color-text)' : 'white'

  return (
    <div ref={ref} className="relative flex items-center gap-3">
      {/* Espace client button */}
      <Link
        href="/espace-client"
        className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
        style={scrolled
          ? { background: 'var(--color-primary)', color: 'white' }
          : { background: 'white', color: 'var(--color-primary-dark)' }}
      >
        Espace client
      </Link>

      {/* Avatar button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Mon compte"
        className="w-8 h-8 rounded-full overflow-hidden border-2 transition-opacity hover:opacity-80 flex items-center justify-center"
        style={{ borderColor: scrolled ? 'var(--color-border)' : 'rgba(255,255,255,0.4)' }}
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-xs font-bold" style={{ color: textColor }}>
            {user.name[0].toUpperCase()}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-52 rounded-2xl shadow-xl py-2 z-50"
          style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="px-4 py-2.5 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{user.name}</p>
          </div>
          {[
            { label: 'Mon espace',     href: '/espace-client' },
            { label: 'Mes annonces',   href: '/espace-client/annonces' },
            { label: 'Mon profil',     href: '/espace-client/profil' },
            ...(user.role === 'ADMIN' ? [{ label: 'Administration', href: '/admin' }] : []),
          ].map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2.5 text-sm transition-colors hover:bg-[oklch(42%_0.09_155_/_0.05)]"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {label}
            </Link>
          ))}
          <div className="border-t mt-1 pt-1" style={{ borderColor: 'var(--color-border)' }}>
            <button
              onClick={() => { /* signOut() in Round 2 */ setOpen(false) }}
              className="w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-[oklch(42%_0.09_155_/_0.05)]"
              style={{ color: 'oklch(50% 0.15 25)' }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Navbar ─────────────────────────────────────────────────────────────────────

interface NavbarProps {
  initialDark?: boolean
}

export function Navbar({ initialDark = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(!initialDark)
  const user = MOCK_USER // will be replaced by useSession() in Round 2

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
      style={scrolled
        ? { background: 'var(--color-surface)', boxShadow: '0 1px 0 var(--color-border)' }
        : { background: 'transparent' }}
    >
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="font-display font-semibold text-lg tracking-tight transition-colors duration-300"
            style={{ color: scrolled ? 'var(--color-text)' : 'white' }}>
            SAKAN
          </span>
        </Link>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-6">
          <Suspense fallback={<NavLinksFallback scrolled={scrolled} />}>
            <NavLinksInner scrolled={scrolled} />
          </Suspense>

          <span className="w-px h-4 rounded" aria-hidden="true"
            style={{ background: scrolled ? 'var(--color-border)' : 'rgba(255,255,255,0.2)' }} />

          {user ? (
            <UserMenu user={user} scrolled={scrolled} />
          ) : (
            <>
              <Link href="/auth" className="text-sm transition-colors duration-200"
                style={{ color: scrolled ? 'var(--color-text-secondary)' : 'rgba(255,255,255,0.62)', fontWeight: 500 }}>
                Se connecter
              </Link>
              <Suspense>
                <PublishButton scrolled={scrolled} />
              </Suspense>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="flex md:hidden">
          <Suspense>
            <PublishButtonMobile scrolled={scrolled} />
          </Suspense>
        </div>
      </nav>
    </header>
  )
}
