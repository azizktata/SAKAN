# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project

**SAKAN · سكن** — Ethical, halal real estate platform for Tunisia. No credit, direct sales, full transparency. Stack: Next.js 16 (App Router) · Tailwind CSS v4 · TypeScript · React 19. Backend (separate repo): Laravel + PostgreSQL/PostGIS + Meilisearch.

## Commands

```bash
npm run dev       # Start dev server (Turbopack by default)
npm run build     # Production build
npm run lint      # Run ESLint
```

> **Note:** Starting with Next.js 16, `next build` no longer runs the linter automatically. `next dev` uses Turbopack by default; use `next dev --webpack` to opt out.

## Architecture

**Next.js 16 App Router** project. Planned directory structure — items marked ✓ are built:

```
/app
  /page.tsx                        ✓ Landing page (full — all sections)
  /logements/page.tsx              ✓ Listings (grid/filter/sort + Leaflet map)
  /logements/[slug]/page.tsx       ✓ Property detail — server component (metadata, notFound)
  /logements/[slug]/detail-client.tsx ✓ Property detail — client component (carousel, contact modal)
  /louer/page.tsx                  → Rental listings (separate from /logements)
  /publier/page.tsx                → Add listing (auth required)
  /dashboard/page.tsx              → Client dashboard (auth required)
  /admin/...                       → Admin panel (Phase 1 — last step)
/components
  /layout/navbar.tsx               ✓ Sticky navbar; `initialDark` prop for hero-overlay mode
  /landing/search-bar.tsx          ✓ Buy/Rent toggle + type select + location input
  /landing/browse-section.tsx      ✓ Browse by city/type (client component, mode toggle)
  /listing/listing-view.tsx        ✓ Full filter bar, property cards, pagination, map/grid toggle
  /listing/MapView.tsx             ✓ Leaflet map with custom price markers and hover tooltips
  /ui                              → Buttons, inputs, badges, cards (not yet created)
  /dashboard                       → Forms, Stats (not yet created)
/data
  /properties.ts         ✓ ALL_PROPERTIES mock array + Property type (includes lat/lng)
  /cities.ts             ✓ Tunisian cities list
  /property-types.ts     ✓ TYPES constant (Appartement, Villa, etc.)
/lib
  /api.ts                → Centralized API calls (not yet created)
  /hooks                 → Custom hooks (not yet created)
  /utils                 → Helpers (not yet created)
```

URL patterns: `/logements`, `/logements?mode=vente&type=Appartement`, `/logements/[slug]`, `/louer`, `/publier`, `/dashboard`, `/admin`.

**Server/client split pattern**: server pages handle metadata and data fetching; a co-located `*-client.tsx` file with `'use client'` handles interactivity. See `/logements/[slug]/` as the reference.

**Current data**: all listings are in `data/properties.ts` as a hardcoded mock array (each `Property` has `lat`/`lng` for map pins). When the Laravel backend is ready, extract to `lib/api.ts` and replace with `fetch` / React Query calls.

**MapView**: uses Leaflet loaded via `next/dynamic` with `ssr: false`. Inside effects, Leaflet is required via `require('leaflet')` to avoid SSR issues. Map styles (`.map-marker`, `.map-tooltip-*`) live in `globals.css`.


## Tailwind CSS v4

Uses **Tailwind CSS v4** with `@tailwindcss/postcss`. CSS entry point: [app/globals.css](app/globals.css) (`@import "tailwindcss"`). Theme tokens live inside `@theme inline { ... }` in CSS — there is **no** `tailwind.config.js`.

## Design System

Tokens are defined in [app/globals.css](app/globals.css). **All colors use OKLCH** (not hex):

```css
@theme inline {
  --color-primary:        oklch(42% 0.09 155);
  --color-primary-light:  oklch(65% 0.12 155);
  --color-primary-dark:   oklch(28% 0.07 155);
  --color-bg:             oklch(98.5% 0.006 155);
  --color-surface:        oklch(100% 0 0);
  --color-border:         oklch(92% 0.008 155);
  --color-muted:          oklch(62% 0.012 155);
  --color-text:           oklch(15% 0.012 155);
  --color-text-secondary: oklch(42% 0.012 155);
  --color-accent:         oklch(68% 0.1 78);   /* soft gold */
  --color-accent-light:   oklch(84% 0.08 78);
  --font-display: var(--font-zilla-slab);
  --font-sans:    var(--font-figtree);
}
```

Fonts loaded in [app/layout.tsx](app/layout.tsx) via `next/font/google`:
- **Display + body**: `Inter` → CSS var `--font-inter`. Both `--font-display` and `--font-sans` in `globals.css` resolve to `var(--font-inter)` (the CLAUDE.md token table showing `var(--font-zilla-slab)` / `var(--font-figtree)` is aspirational — not yet wired up).
- Arabic fallback (Phase 2): `Cairo`

Animations `fade-up` and `fade-in` are defined in globals.css and applied inline via `animationName` style props (not Tailwind classes).

UI principles: mobile-first (test at 375px), one primary action per screen, soft shadows only, no loud gradients, light micro-interactions. Avoid `style={{ color: 'var(--color-...)' }}` repetition — prefer Tailwind utilities where possible; inline styles are acceptable for dynamic/theme values.

## Development Phases

See [SAKAN.md](SAKAN.md) for the full roadmap. Phase 1 order:
1. ✓ Design system & base UI
2. ✓ Navbar
3. ✓ Landing page
4. ✓ Listing page — grid view
5. ✓ Listing page — map view (Leaflet, not Google Maps)
6. ✓ Property detail page (`/logements/[slug]`)
7. Auth (Google OAuth via Laravel Sanctum)
8. Client dashboard (including 6-step "add listing" flow)
9. **Admin panel — last step**

## Key Implementation Notes

- **i18n**: Plan for FR/AR from the start using `next-intl` or `i18next`. Arabic UI is Phase 2 but the structure must be ready.
- **Images**: Upload to S3/Cloudflare R2, store URLs in DB — no local storage. `next.config.ts` whitelists `images.unsplash.com` for remote images.
- **Mosque proximity filter**: PostGIS `ST_DWithin` with configurable radius (300m / 500m / 1km).
- **SEO**: Dynamic metadata (`generateMetadata`) on every property page (title, description, OG image).
- **Map**: Leaflet (OpenStreetMap tiles) for split map/list view. Property detail embed TBD.
- **`/impeccable` skill**: Available for UI work — provides design guidelines and references. Run `/impeccable teach` first to set up project design context if `.impeccable.md` does not exist.
