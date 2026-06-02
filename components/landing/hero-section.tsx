'use client'

import { useState } from 'react'
import { SearchBar } from '@/components/landing/search-bar'
import { HeroStrip } from '@/components/landing/hero-strip'
import type { Property, Location } from '@/lib/api'

interface HeroSectionProps {
  saleProperties: Property[]
  rentProperties: Property[]
  locations: Location[]
}

export function HeroSection({ saleProperties, rentProperties, locations }: HeroSectionProps) {
  const [mode,        setMode]        = useState<'vente' | 'location'>('vente')
  const [stripOpen,   setStripOpen]   = useState(true)

  return (
    <section
      className="relative flex flex-col overflow-hidden"
      style={{ background: 'var(--color-primary)', minHeight: '100dvh' }}
    >
      {/* Background video */}
      <video
        autoPlay muted loop playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.75 }}
      >
        <source src="/sakan-video.mp4" type="video/mp4" />
      </video>

      {/* Overlay — stronger at top/bottom, lighter in centre */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'linear-gradient(to bottom, oklch(20% 0.06 130 / 0.82) 0%, oklch(26% 0.07 130 / 0.6) 45%, oklch(22% 0.06 130 / 0.85) 100%)',
      }} />

      {/* Content — left-aligned, max-width container */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-36 pt-24 pb-8 max-w-5xl">

        {/* Subtle label */}
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em]"
          style={{ color: 'var(--color-accent-light)', fontFamily: 'var(--font-sans)' }}>
          Immobilier · Tunisie
        </p>

        {/* Headline */}
        <h1
          className="font-display font-bold leading-[1.05] mb-5"
          style={{
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            color: 'oklch(95% 0.01 70)',
            letterSpacing: '-0.02em',
            maxWidth: '22ch',
          }}
        >
          L&rsquo;immobilier tunisien,{' '}
          <span style={{ color: 'var(--color-accent-light)' }}>sans détours.</span>
        </h1>

        <p className="mb-8 leading-relaxed"
          style={{
            fontSize: 'clamp(0.875rem, 1.4vw, 1rem)',
            color: 'oklch(72% 0.012 70)',
            maxWidth: '44ch',
            fontFamily: 'var(--font-sans)',
          }}>
          Vente &amp; location directe — sans crédit caché, sans frais d&rsquo;agence.
        </p>

        <div className="w-full max-w-xl">
          <SearchBar onModeChange={setMode} locations={locations} />
        </div>
      </div>

      {/* Strip section */}
      <div className="relative z-10">

        {/* Divider row — label left, toggle right */}
        <div
          className="flex items-center justify-between px-6 md:px-12 lg:px-36 py-2"
          style={{ borderTop: '1px solid oklch(45% 0.06 130 / 0.5)' }}
        >
          <span
            className="text-[0.65rem] font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'oklch(55% 0.012 70)', fontFamily: 'var(--font-sans)' }}
          >
            Annonces en direct
          </span>

          <button
            onClick={() => setStripOpen((o) => !o)}
            aria-label={stripOpen ? 'Masquer les annonces' : 'Afficher les annonces'}
            className="cursor-pointer hover:text-white flex items-center gap-1 text-[0.65rem] font-medium uppercase tracking-[0.14em] transition-colors duration-200"
            style={{ color: 'oklch(50% 0.012 70)', fontFamily: 'var(--font-sans)', opacity: 0.75 }}
          >
            {stripOpen ? 'Masquer' : 'Afficher'}
            <svg
              className="w-3 h-3 transition-transform duration-300"
              style={{ transform: stripOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Strip — slides in/out */}
        <div
          className="overflow-hidden transition-all duration-500"
          style={{
            maxHeight: stripOpen ? '200px' : '0px',
            opacity: stripOpen ? 1 : 0,
          }}
        >
          <HeroStrip
            saleProperties={saleProperties}
            rentProperties={rentProperties}
            mode={mode}
          />
        </div>
      </div>
    </section>
  )
}
