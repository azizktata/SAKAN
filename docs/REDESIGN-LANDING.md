# SAKAN Landing Page Redesign
## Design Document — 3 Version Concepts

> **Scope**: Landing page only. Three genuinely different aesthetic directions, each with its own content priority, visual identity, typography, palette variant, and section order. One design system document that anchors all three.

---

## New Design System

All three versions share these foundational tokens but diverge in how they apply them.

### Color Palette (shared base)

```css
/* Authority layer — deep olive */
--color-primary:         oklch(32% 0.08 130);   /* deep olive, serious, rooted */
--color-primary-hover:   oklch(28% 0.07 130);
--color-primary-muted:   oklch(32% 0.08 130 / 0.12);

/* Warmth layer — terracotta */
--color-accent:          oklch(58% 0.14 45);    /* burnt terracotta, Tunisian stone */
--color-accent-light:    oklch(76% 0.1 50);     /* warm sand */
--color-accent-dim:      oklch(58% 0.14 45 / 0.15);

/* Premium signal — saharan amber */
--color-gold:            oklch(68% 0.13 75);    /* saharan gold */
--color-gold-light:      oklch(84% 0.08 78);

/* Surfaces */
--color-bg:              oklch(97% 0.012 70);   /* warm off-white, terracotta tint */
--color-surface:         oklch(99% 0.008 70);   /* near-white */
--color-surface-warm:    oklch(95% 0.018 65);   /* warm cream for section bg */
--color-surface-deep:    oklch(93% 0.022 68);   /* terracotta wash */

/* Text */
--color-text:            oklch(14% 0.02 70);    /* near-black, warm undertone */
--color-text-secondary:  oklch(40% 0.018 70);
--color-muted:           oklch(60% 0.014 70);

/* Borders */
--color-border:          oklch(88% 0.018 70);
--color-border-strong:   oklch(78% 0.025 70);
```

### Typography System

**Font pairing** (applied across all 3 versions — specific weight/size usage varies):

- **Display**: `Canela` (editorial weight, confidence) — fallback: Georgia
  - Load via `@font-face` from CDN or self-hosted
  - Used for: H1, H2, section labels, large numbers
  - Key: use Light (300) and Regular (400) at large sizes; Medium (500) at small sizes
  
- **Body**: `Geist` by Vercel (clean grotesque, warm numerals, excellent Arabic-adjacent rhythm)
  - Used for: body text, UI elements, metadata, navigation
  - Available as npm package `geist` — already may be in project

**Type scale (fluid headings, fixed body):**

```css
/* Fluid display — marketing sections */
--text-hero:      clamp(3rem, 7vw, 6rem);       /* Hero H1 — commanding */
--text-display:   clamp(2.25rem, 5vw, 4rem);    /* Section H2 */
--text-heading:   clamp(1.6rem, 3vw, 2.5rem);   /* Subsection H2 */
--text-title:     clamp(1.25rem, 2.5vw, 1.75rem); /* Card/item titles */

/* Fixed — UI and body */
--text-body-lg:   1.0625rem;   /* 17px — primary body */
--text-body:      0.9375rem;   /* 15px — secondary body */
--text-sm:        0.8125rem;   /* 13px — labels, metadata */
--text-xs:        0.6875rem;   /* 11px — stamps, fine print */
```

### Spacing Scale (4pt, semantic tokens)

```css
--space-1:   4px;
--space-2:   8px;
--space-3:   12px;
--space-4:   16px;
--space-6:   24px;
--space-8:   32px;
--space-12:  48px;
--space-16:  64px;
--space-24:  96px;
--space-32:  128px;
```

### Motion

```css
/* Easing */
--ease-out-expo:   cubic-bezier(0.16, 1, 0.3, 1);
--ease-out-quart:  cubic-bezier(0.25, 1, 0.5, 1);
--ease-spring:     cubic-bezier(0.34, 1.56, 0.64, 1);  /* use sparingly — short ranges only */

/* Durations */
--duration-fast:   150ms;
--duration-base:   250ms;
--duration-slow:   400ms;
--duration-reveal: 700ms;
```

---

## Version A — "The Masthead"

**Concept**: Editorial authority. The landing page as a well-designed newspaper front page for Tunisia's most trusted property platform. Every section feels like it was typeset with intention. Heavy on typographic hierarchy, rich color blocks, and confident asymmetry. Content priority: **Trust first → Search → City browsing → Values → Recent listings → CTA**.

### What makes it unforgettable
A full-bleed deep olive header with a massive, Canela-set wordmark "سكن · SAKAN" in cream — the kind of masthead you'd see on a 1970s North African architecture journal. The search bar is not a modal or popup; it sits as a bold horizontal element breaking the hero section. The values section uses large numerals as typographic decoration, not small circular badges.

### Palette application (Version A)
- Hero background: `--color-primary` (deep olive) — full bleed, no photo
- Hero text: `oklch(96% 0.01 70)` — warm cream
- Section alternation: warm off-white → cream → deep olive (footer)
- Accent stripes: terracotta for structural separators (full-width 2px rules, not card borders)
- Card background: `--color-surface-warm` with terracotta border on hover

### Font application (Version A)
- Hero H1: Canela Light 300, `--text-hero`, letter-spacing `-0.02em` — the Arabic and French name stacked or side by side
- Section headings: Canela Regular 400
- Body: Geist 400/450
- Label stamps: Geist 600 uppercase, `--text-xs`, tracking `0.15em`

### Section order & content (Version A)

**1. Hero — Full-bleed Authority**
```
[ MASTHEAD BAR ]  SAKAN · سكن                           [Nav links]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ LARGE STAMP: "Immobilier éthique. Vente directe. Tunisie." ]

[ HERO H1 Canela Light — full width, 2 lines max ]
  Trouvez le bien
  qui vous ressemble.

[ INLINE SEARCH BAR — full width, elevated ]
  [Type] [Location] [Vente / Location] [Budget]  [Rechercher →]

[ HORIZONTAL PILL ROW — terracotta tint bg ]
  Tunis · Sfax · Sousse · La Marsa · Hammamet
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

*Background*: deep olive full-bleed. No hero photography. The confidence of text-only is the statement.

**2. Trust Strip — 4 numbers, full-bleed terracotta-tinted**
```
[ 0 DT frais ]  [ 100% direct ]  [ Données 2025 ]  [ Halal certifié ]
```
Large numerals/words in Canela, small labels in Geist. Horizontal band, no cards.

**3. Browse by city — asymmetric editorial grid**
```
[ 2-col: LEFT: big section heading + description (40%)
         RIGHT: 3×2 city tiles with property count overlaid (60%) ]
```
City tiles: square, photo background, city name in Canela at bottom, property count in terracotta badge.

**4. Why SAKAN — 3 values, large numbered**
```
[ Section label: "Pourquoi SAKAN" — left aligned, Canela Display ]

  01                           02                           03
  Transparence                 Éthique & Halal              Simplicité
  totale                                                    radicale
  ─────────────────            ─────────────────            ─────────────────
  [ body copy ]                [ body copy ]                [ body copy ]
  
  [ Photo: Tunisian           [ — ]                        [ — ]
    courtyard, full-height ]
```
3-column rule: the first value column contains a tall photo. The separator is a 1px full-height border in `--color-border-strong`.

**5. How it works — horizontal timeline**
```
[ STAMP: "Comment ça marche" ]

   ①──────────────②──────────────③
   Recherchez     Consultez      Contactez
   [ copy ]       [ copy ]       [ copy ]
```
Numbers are large (96px) Canela numerals in `--color-primary-muted` overlapping the step heading. Connector is a thin terracotta dashed line.

**6. Recent listings — dense editorial grid**
```
[ Heading left ]                              [ → Voir tout ]

  [ LARGE CARD — property 1, 2-col wide ]  [ SMALL CARD ]
                                           [ SMALL CARD ]
  [ SMALL CARD ]  [ SMALL CARD ]  [ SMALL CARD ]
```
Asymmetric grid: first property is featured (larger). Cards have no rounded corners — straight-edge `border-radius: 4px` gives a publication feel.

**7. Estimation CTA — full-bleed deep olive**
```
[ Left: heading + body + CTA button (cream) ]
[ Right: 4 price data rows — styled as a data table, not cards ]
```

**8. Owner CTA — terracotta wash background**
```
[ Left: 60% — heading + copy + 2 buttons ]
[ Right: 40% — property photo, no border radius on top edge ]
```

**9. Footer** — structured 4-column, deep navy (`oklch(14% 0.015 250)`), Canela wordmark in cream

---

## Version B — "The Property Magazine"

**Concept**: Editorial richness with photography as the primary design material. Every section uses real estate photography in unexpected, non-standard compositions. Feels like Architectural Digest has a Tunisian edition. Content priority: **Gallery/aspiration first → Search → Recent listings → Values → CTA**.

### What makes it unforgettable
A split hero: left half is a **full-height photo mosaic** (3 stacked portrait images from Tunisian properties), right half is the headline and search. The hero is landscape by default — photography is content, not backdrop. A mid-page "editorial spread" section shows 5 properties in a magazine-style asymmetric photo grid with no card frames — just images, captions, and prices floating over them.

### Palette application (Version B)
- Hero: no background color — the photography fills both halves
- Overlays: `oklch(14% 0.02 70 / 0.45)` — warm near-black, not the AI default pure black
- Section bg: alternates `--color-bg` and `--color-surface-deep`
- Primary CTA button: terracotta filled (`--color-accent`)
- Secondary CTA: deep olive stroke
- Section headings: terracotta accent for the small label stamp above each H2

### Font application (Version B)
- Hero H1: Canela Regular 400, `--text-hero`, tracking `-0.01em`
- All body: Geist 400
- Price display: Canela Medium 500, tabular nums
- Metadata / labels: Geist 500 uppercase, `--text-xs`, tracking `0.12em`, in `--color-accent`

### Section order & content (Version B)

**1. Hero — Split: mosaic photography + text**
```
┌──────────────────────┬──────────────────────────────────┐
│                      │                                  │
│  [ Photo 1 — tall ]  │  SAKAN · سكن                    │
│  [ Photo 2 — med  ]  │                                  │
│  [ Photo 3 — small]  │  Votre prochain chez-vous        │
│                      │  vous attend en Tunisie.         │
│                      │                                  │
│  Left: 40% width     │  [ Search bar — vertical stack ] │
│  Right: 60% width    │  [ Pill row — property types ]   │
│                      │                                  │
└──────────────────────┴──────────────────────────────────┘
```
*Mobile*: photos become a horizontal scrolling strip above the text.

**2. Recent listings — Editorial photo spread (primary showcase)**
```
[ STAMP: "Sélection de la semaine" ]

┌──────────────────────────────┬──────────┬──────────┐
│                              │          │          │
│  [ FEATURED property photo   │ Prop 2   │ Prop 3   │
│    full height, 2-col wide ] │          │          │
│                              ├──────────┴──────────┤
│  Price + Location overlay    │  Prop 4             │
│  at bottom of image          │  (landscape)        │
└──────────────────────────────┴─────────────────────┘
                                    [ → Voir les 200+ biens ]
```
Images are flush — no card frames, no padding. Price and title float over a bottom gradient. Gap between images: `4px`.

**3. Browse by city — horizontal scroll strip**
```
  ← TUNIS    SFAX    SOUSSE    LA MARSA    HAMMAMET    NABEUL →
```
Each city is a wide landscape photo card (16:9) with city name in large Canela and property count. Scroll-snapping on mobile.

**4. Why SAKAN — alternating rows with illustration/photo**
```
[ Row 1: Left photo (Tunisian street market) | Right: "Transparence totale" heading + copy ]
[ Row 2: Left: "Éthique & Halal" heading + copy | Right: photo (mosque courtyard) ]
[ Row 3: Left photo (family in apartment) | Right: "Simplicité radicale" heading + copy ]
```
Full-bleed section with `--color-surface-deep` background. Photos extend to the container edge but not full viewport. Rows separated by 1px `--color-border` rules.

**5. How it works — 3 steps with property search demo screenshots (or illustrated mockups)**
```
[ Step 1 ] [ → ] [ Step 2 ] [ → ] [ Step 3 ]
[ mobile screenshot or illustration ]
```
Progression is shown horizontally. If no screenshots, use solid colored squares (terracotta, olive, sand) with icon + number in Canela.

**6. Estimation CTA — full magazine spread**
```
┌──────────────────────────────────────────────────────────┐
│  Background: --color-surface-deep (terracotta wash)      │
│                                                          │
│  [ Left 55%: ]                                           │
│  STAMP: "Estimation IA"                                  │
│  H2: Combien vaut votre bien ?                           │
│  Body copy                                               │
│  [ CTA: olive filled button ]                            │
│                                                          │
│  [ Right 45%: architecture photo, tall, rounded-left ]   │
└──────────────────────────────────────────────────────────┘
```

**7. Owner CTA — dark band**
```
Background: --color-primary (deep olive)
[ Full width heading: large Canela centered ]
"Vendez ou louez directement."
[ 2 CTAs centered: cream button + ghost button ]
[ Below: 3 trust micro-labels — 0 DT · Direct · Sécurisé ]
```

**8. Footer** — warm off-white background, airy — opposite of the dark masthead footer in Version A

---

## Version C — "The Institution"

**Concept**: Serious, dense, functional — like the website of Tunisia's most trusted financial institution, but built for real estate. Inspired by European property portals (SeLoger, Immoweb) executed with much higher design quality and Tunisian cultural grounding. Content priority: **Search first (above the fold, no hero image) → Browse → Trust/Values → Listings → Estimation**.

### What makes it unforgettable
There is **no hero photo**. The first thing you see is the SAKAN logotype, a confident 2-line headline, and a **full-featured search form** — all visible above the fold. This breaks every real estate homepage convention, which is exactly the point. It signals: "we are a search tool, not a brochure." Below the fold, a warm terracotta-tinted banner with market data (prices per m² by city) acts as the trust signal instead of photography.

### Palette application (Version C)
- Primary background: `--color-bg` (warm off-white throughout)
- Primary color: `--color-primary` for headings, badges, CTAs
- Accent: `--color-accent` (terracotta) for the market data band and secondary highlights
- Data display: Canela numerals in `--color-primary` on `--color-surface-warm`
- Strong separator: full-width 1.5px `--color-accent` rule between major sections (not card borders)

### Font application (Version C)
- Headline: Canela Medium 500, `--text-display`, tight leading
- Data/numbers: Canela Bold 700, tabular-nums — for prices, market data
- Body: Geist 400
- Navigation: Geist 500, `--text-sm`
- Form labels: Geist 600, `--text-xs` uppercase, `--color-text-secondary`

### Section order & content (Version C)

**1. Above the fold — Functional hero (no photography)**
```
┌──────────────────────────────────────────────────────────┐
│  [ NAV ]  SAKAN · سكن                    Connexion  Publier│
├──────────────────────────────────────────────────────────┤
│                                                          │
│  STAMP: "Plateforme immobilière éthique · Tunisie"       │
│                                                          │
│  H1 (Canela): Trouvez votre bien.                        │
│               Sans intermédiaire.                        │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ [Type ▾]  [Localisation ▾]  [Budget ▾]  [Pièces ▾] │ │
│  │                                      [Vente][Locat] │ │
│  │                         [Rechercher →]              │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  Suggestions: Appartement Tunis · Villa La Marsa · ...   │
└──────────────────────────────────────────────────────────┘
```
Full viewport height. Background: `--color-bg`. The search form has a strong `box-shadow` and a `1px --color-border-strong` border. This is the design statement: we're a search product.

**2. Market data band — terracotta authority**
```
Background: --color-accent (terracotta)  |  Text: cream + white
┌──────────┬──────────┬──────────┬────────────┐
│  Tunis   │  Sfax    │  Sousse  │  La Marsa  │
│ 3 200    │ 1 800    │ 2 600    │  6 500     │
│ DT/m²    │ DT/m²    │ DT/m²    │  DT/m²    │
└──────────┴──────────┴──────────┴────────────┘
         Prix médians vente · Marché tunisien 2025
```
Canela Bold numerals in cream on terracotta. No cards — just a grid with fine white separator lines. This is the trust signal: we have real data.

**3. Browse by category — 2 rows, typed grid**
```
[ Vente ]                              [ Location ]
  Appartements  Villas  Maisons          Appartements  Bureaux  Villas
  [ 847 biens ] [ 234 ] [ 156 ]         [ 612 biens ] [ 89 ]  [ 178 ]
```
Each category is a rectangular tile (not rounded) with type label, sub-type, and count. Olive background on hover.

**4. Recent listings — clean tabular list + cards hybrid**
```
[ Heading ]                            [ → Voir tout ]

FEATURED:  [ 2-col wide card — photo left, all details right ]

GRID:
  [ Card ] [ Card ] [ Card ] [ Card ]
```
The featured card is styled like a newspaper classified listing — address, size, price, contact. The grid cards are denser than Version A/B.

**5. Values — 3 columns, text-heavy, substantial**
```
     01                   02                   03
  Transparence         Éthique              Simplicité
  totale               & Halal              radicale

  ────────────         ────────────         ────────────
  [40-word copy]       [40-word copy]       [40-word copy]
  
  [ Learn more → ]    [ Learn more → ]     [ Learn more → ]
```
Separator: a full-width 1px olive rule above the section. Column separators: 1px vertical `--color-border` rules between the 3 columns. No icons, no rounded badges — numbers in large Canela, plain.

**6. How it works — numbered, dense**
```
[ Full-width. 3 steps in a horizontal row with connector arrows ]
Step ① → Step ② → Step ③
[ Each step: number badge (solid olive), heading, 2-line copy ]
```

**7. Estimation CTA — contained card (not full-bleed)**
```
Background: --color-surface-warm (cream)
[ Left: heading, copy, CTA ]
[ Right: 4 price rows as a proper data table with thead, striped bg ]
```
The data table has a real `<table>` structure. No `border-left` accents. Alternating row backgrounds in `--color-bg` / `--color-surface`.

**8. Owner section — 2-col, text-dense**
```
Background: --color-primary
[ Left: big number "0 DT" + "de frais d'agence" + copy + CTA ]
[ Right: bulleted list of 5 concrete benefits, icon-free ]
```

**9. Footer** — 5-column, structured, warm off-white (light footer for light overall palette)

---

## Comparison Matrix

| Dimension            | Version A: Masthead        | Version B: Property Magazine | Version C: Institution     |
|----------------------|----------------------------|-------------------------------|----------------------------|
| **First impression** | Editorial authority        | Aspiration & beauty           | Functional confidence      |
| **Hero type**        | Text-only, deep olive      | Split: photo mosaic + text    | Search form, no photo      |
| **Content priority** | Trust → Search → Browse    | Gallery → Browse → Values     | Search → Data → Browse     |
| **Photography role** | Sections 3, 6, 8           | Central, primary material     | Minimal, supporting only   |
| **Type personality** | Large, commanding, masthead| Editorial, caption-led        | Functional, data-authority |
| **Density**          | High — editorial richness  | Medium — breathing room       | High — portal/institution  |
| **Primary audience** | Family buyer (trust-first) | Young professional (aspiration)| Diaspora (data-credibility)|
| **Emotional tone**   | Pride · Credibility        | Desire · Discovery            | Confidence · Clarity       |
| **Uniqueness lever** | No hero photo: just words  | Photography as architecture   | No hero at all: search     |

---

## Shared Implementation Notes

### Next.js specifics
- Each version is a branch/candidate implementation of `sakan/app/page.tsx`
- Fonts: add `Canela` via `@font-face` in `globals.css` (self-host) or via CDN; add `Geist` via `next/font/local` (already available as `geist` npm package)
- Keep server component data fetching (`fetchFeatured`) — all 3 versions use real API data
- `BrowseSection` client component reused in all 3 — restyled via props/className not internal changes

### Tailwind v4 token mapping
New tokens go in `globals.css` under `@theme inline`. Replace the current palette block entirely:

```css
@theme inline {
  /* New palette — replace existing */
  --color-primary:        oklch(32% 0.08 130);
  --color-primary-hover:  oklch(28% 0.07 130);
  --color-primary-muted:  oklch(32% 0.08 130 / 0.12);
  --color-accent:         oklch(58% 0.14 45);
  --color-accent-light:   oklch(76% 0.1 50);
  --color-accent-dim:     oklch(58% 0.14 45 / 0.15);
  --color-gold:           oklch(68% 0.13 75);
  --color-bg:             oklch(97% 0.012 70);
  --color-surface:        oklch(99% 0.008 70);
  --color-surface-warm:   oklch(95% 0.018 65);
  --color-surface-deep:   oklch(93% 0.022 68);
  --color-text:           oklch(14% 0.02 70);
  --color-text-secondary: oklch(40% 0.018 70);
  --color-muted:          oklch(60% 0.014 70);
  --color-border:         oklch(88% 0.018 70);
  --color-border-strong:  oklch(78% 0.025 70);
  
  /* New fonts */
  --font-display: var(--font-canela);
  --font-sans:    var(--font-geist);
}
```

### What NOT to carry forward from the current design
- `rounded-3xl` on everything — use context-appropriate radius (0–8px for editorial, 12px max for cards in Version B)
- `shadow-[0_2px_16px_rgb(0_0_0/0.07)]` generic card shadows — replace with border or color contrast
- The muted green palette — replace entirely with new tokens
- `Inter` as both display and body — replace with Canela + Geist
- Hero section capped at `480px`/`600px` — Version A and C hero should be full viewport height
- The commented-out trust bar and inspiration grid — either revive properly or remove permanently

---

## Recommended Next Step

**Start with Version A** — it has the clearest aesthetic identity and the most distinctive constraint (no hero photo), which forces every other design decision to be intentional. Once Version A is validated, Versions B and C reuse most of the token system with surface-level changes.

Implementation order per version:
1. Update `globals.css` with new token system + font loading
2. Rewrite hero section first — confirm the aesthetic feels right before building the rest
3. Build sections top to bottom
4. Run `/impeccable craft` for any section that needs detailed component-level guidance
