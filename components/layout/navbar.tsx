'use client'

import Link from 'next/link'
import { useEffect, useState, Suspense, useRef } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

const NAV_LINKS = [
  { label: 'Vente',    href: '/logements?mode=vente',    mode: 'vente'    },
  { label: 'Location', href: '/logements?mode=location', mode: 'location' },
]

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

// ── Estimer button (opens estimation dialog via ?estimer=open) ────────────────

function EstimerButton({ scrolled }: { scrolled: boolean }) {
  const router       = useRouter()
  const pathname     = usePathname()
  const searchParams = useSearchParams()

  function open() {
    const params = new URLSearchParams(searchParams.toString())
    params.set('estimer', 'open')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const color = scrolled ? 'var(--color-text-secondary)' : 'rgba(255,255,255,0.72)'

  return (
    <button
      onClick={open}
      className="text-sm font-medium transition-colors duration-200"
      style={{ color }}
      onMouseEnter={(e) => (e.currentTarget.style.color = scrolled ? 'var(--color-text)' : 'white')}
      onMouseLeave={(e) => (e.currentTarget.style.color = color)}
    >
      Estimer
    </button>
  )
}

// ── User avatar dropdown (logged-in state, desktop) ───────────────────────────

type AuthUser = { name: string; image?: string | null; role: string }

function UserMenu({ user, scrolled }: { user: AuthUser; scrolled: boolean }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { logout } = useAuth()

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
      <Link
        href={user.role === 'admin' ? '/admin' : '/espace-client'}
        className="px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200"
        style={scrolled
          ? { background: 'var(--color-primary)', color: 'white' }
          : { background: 'white', color: 'var(--color-primary-dark)' }}
      >
        {user.role === 'admin' ? 'Espace admin' : 'Espace client'}
      </Link>

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
            ...(user.role === 'admin' ? [{ label: 'Administration', href: '/admin' }] : []),
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
              onClick={() => { setOpen(false); logout() }}
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

// ── Mobile hamburger menu ─────────────────────────────────────────────────────

function MobileMenuLink({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href.split('?')[0]))
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center px-3 py-3.5 rounded-xl text-sm font-medium transition-colors"
      style={{
        color:      isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
        background: isActive ? 'oklch(42% 0.09 155 / 0.07)' : 'transparent',
        fontWeight: isActive ? 600 : 500,
      }}
    >
      {label}
    </Link>
  )
}

function MobileMenu({ scrolled }: { scrolled: boolean }) {
  const [open, setOpen] = useState(false)
  const { user, logout } = useAuth()
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  const iconColor = scrolled ? 'var(--color-text)' : 'white'

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Ouvrir le menu" className="p-2 -mr-1">
        <svg width="22" height="22" fill="none" viewBox="0 0 22 22" aria-hidden="true">
          <line x1="2" y1="5"  x2="20" y2="5"  stroke={iconColor} strokeWidth="1.75" strokeLinecap="round" />
          <line x1="2" y1="11" x2="20" y2="11" stroke={iconColor} strokeWidth="1.75" strokeLinecap="round" />
          <line x1="2" y1="17" x2="20" y2="17" stroke={iconColor} strokeWidth="1.75" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--color-surface)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 h-16 border-b shrink-0"
            style={{ borderColor: 'var(--color-border)' }}>
            <Link href="/" onClick={() => setOpen(false)}
              className="font-display font-semibold text-lg tracking-tight"
              style={{ color: 'var(--color-text)' }}>
              SAKAN
            </Link>
            <button onClick={() => setOpen(false)} aria-label="Fermer" className="p-2 -mr-1">
              <svg width="22" height="22" fill="none" viewBox="0 0 22 22" aria-hidden="true">
                <line x1="4" y1="4" x2="18" y2="18" stroke="var(--color-text)" strokeWidth="1.75" strokeLinecap="round" />
                <line x1="18" y1="4" x2="4" y2="18" stroke="var(--color-text)" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-3 py-4">
            {user && (
              <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl"
                style={{ background: 'oklch(42% 0.09 155 / 0.05)' }}>
                <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0"
                  style={{ background: 'oklch(42% 0.09 155 / 0.12)' }}>
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.image} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                      {user.name[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>{user.name}</p>
                  <p className="text-xs capitalize" style={{ color: 'var(--color-muted)' }}>{user.role}</p>
                </div>
              </div>
            )}

            <nav className="space-y-0.5">
              {user ? (
                <>
                  <MobileMenuLink href="/espace-client"          label="Tableau de bord" onClick={() => setOpen(false)} />
                  <MobileMenuLink href="/espace-client/annonces" label="Mes annonces"    onClick={() => setOpen(false)} />
                  <MobileMenuLink href="/espace-client/contacts" label="Contacts"        onClick={() => setOpen(false)} />
                  <MobileMenuLink href="/espace-client/profil"   label="Mon profil"      onClick={() => setOpen(false)} />
                  {user.role === 'admin' && (
                    <MobileMenuLink href="/admin" label="Administration" onClick={() => setOpen(false)} />
                  )}
                  <div className="my-3 border-t" style={{ borderColor: 'var(--color-border)' }} />
                  <MobileMenuLink href="/logements?mode=vente"    label="Vente"    onClick={() => setOpen(false)} />
                  <MobileMenuLink href="/logements?mode=location" label="Location" onClick={() => setOpen(false)} />
                </>
              ) : (
                <>
                  <MobileMenuLink href="/logements?mode=vente"    label="Vente"         onClick={() => setOpen(false)} />
                  <MobileMenuLink href="/logements?mode=location" label="Location"      onClick={() => setOpen(false)} />
                  <MobileMenuLink href="/auth"                    label="Se connecter"  onClick={() => setOpen(false)} />
                </>
              )}
            </nav>
          </div>

          {/* Footer actions */}
          <div className="px-4 py-4 border-t space-y-2 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
            <Link
              href="?estimer=open"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center w-full py-3 rounded-2xl text-sm font-semibold border"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}
            >
              Estimer mon bien
            </Link>
            <Link
              href="?publish=open"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center w-full py-3 rounded-2xl text-sm font-semibold text-white"
              style={{ background: 'var(--color-primary)' }}
            >
              + Publier un bien
            </Link>
            {user && (
              <button
                onClick={() => { setOpen(false); logout() }}
                className="w-full py-3 rounded-2xl text-sm font-semibold"
                style={{ background: 'oklch(52% 0.15 25 / 0.07)', color: 'oklch(45% 0.15 25)' }}
              >
                Déconnexion
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// ── Navbar ─────────────────────────────────────────────────────────────────────

interface NavbarProps {
  initialDark?: boolean
}

export function Navbar({ initialDark = false }: NavbarProps) {
  const [scrolled, setScrolled] = useState(!initialDark)
  const { user } = useAuth()

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

          <Suspense>
            <EstimerButton scrolled={scrolled} />
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

        {/* Mobile hamburger */}
        <div className="flex md:hidden">
          <MobileMenu scrolled={scrolled} />
        </div>
      </nav>
    </header>
  )
}
