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
  const [mode, setMode] = useState<'vente' | 'location'>('vente')

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
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-12 lg:px-20 pt-24 pb-8 max-w-5xl">

        {/* Subtle label */}
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em]"
          style={{ color: 'var(--color-accent-light)', fontFamily: 'var(--font-sans)' }}>
          Immobilier · Tunisie
        </p>

        {/* Headline — left-aligned, subtler size */}
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

      {/* Scrolling strip */}
      <div className="relative z-10" style={{ borderTop: '1px solid oklch(45% 0.06 130 / 0.5)' }}>
        <HeroStrip
          saleProperties={saleProperties}
          rentProperties={rentProperties}
          mode={mode}
        />
      </div>
    </section>
  )
}
