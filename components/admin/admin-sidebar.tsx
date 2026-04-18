'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { label: 'Tableau de bord', href: '/admin' },
  { label: 'Annonces',        href: '/admin/annonces' },
  { label: 'Utilisateurs',    href: '/admin/utilisateurs' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 min-h-screen sticky top-0"
      style={{ background: 'var(--color-primary-dark)' }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor: 'oklch(100% 0 0 / 0.1)' }}>
        <Link href="/" className="font-display font-semibold text-lg tracking-tight text-white">
          SAKAN
        </Link>
        <p className="text-[0.65rem] font-semibold uppercase tracking-widest mt-0.5" style={{ color: 'oklch(100% 0 0 / 0.45)' }}>
          Administration
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ label, href }) => {
          const active = isActive(href)
          return (
            <Link key={href} href={href}
              className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: active ? 'oklch(100% 0 0 / 0.1)' : 'transparent',
                color: active ? 'white' : 'oklch(100% 0 0 / 0.6)',
              }}>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t space-y-0.5" style={{ borderColor: 'oklch(100% 0 0 / 0.1)' }}>
        <Link href="/espace-client"
          className="flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ color: 'oklch(100% 0 0 / 0.6)' }}>
          Espace client
        </Link>
        <button
          onClick={() => { /* signOut() in Round 2 */ }}
          className="w-full text-left flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors"
          style={{ color: 'oklch(100% 0 0 / 0.5)' }}>
          Déconnexion
        </button>
      </div>
    </aside>
  )
}
