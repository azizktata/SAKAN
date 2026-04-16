# SAKAN — سكن · Project Reference

> Plateforme immobilière éthique & halal — Tunisie
>
> Stack: Next.js · Tailwind · Laravel · PostgreSQL + PostGIS

---

## Table of Contents

1. [Brand &amp; Values](https://claude.ai/chat/85062f61-8223-4a1f-8fe3-39284d52fa06#1-brand--values)
2. [Design System](https://claude.ai/chat/85062f61-8223-4a1f-8fe3-39284d52fa06#2-design-system)
3. [Architecture technique](https://claude.ai/chat/85062f61-8223-4a1f-8fe3-39284d52fa06#3-architecture-technique)
4. [Phase 1 — Frontend Roadmap](https://claude.ai/chat/85062f61-8223-4a1f-8fe3-39284d52fa06#4-phase-1--frontend-roadmap)
5. [Navigation &amp; Structure](https://claude.ai/chat/85062f61-8223-4a1f-8fe3-39284d52fa06#5-navigation--structure)
6. [Landing Page](https://claude.ai/chat/85062f61-8223-4a1f-8fe3-39284d52fa06#6-landing-page)
7. [Listing Page](https://claude.ai/chat/85062f61-8223-4a1f-8fe3-39284d52fa06#7-listing-page)
8. [Product Page](https://claude.ai/chat/85062f61-8223-4a1f-8fe3-39284d52fa06#8-product-page)
9. [Espace Client (Dashboard)](https://claude.ai/chat/85062f61-8223-4a1f-8fe3-39284d52fa06#9-espace-client-dashboard)
10. [Admin Panel](https://claude.ai/chat/85062f61-8223-4a1f-8fe3-39284d52fa06#10-admin-panel)

---

## 1. Brand & Values

**Nom :** SAKAN · سكن

**Positionnement :** Plateforme immobilière éthique, sans crédit, vente directe, transparence totale.

| Pilier              | Description                                          |
| ------------------- | ---------------------------------------------------- |
| 🤝 Transparence     | Informations claires, sans ambiguïté               |
| 🕌 Éthique / Halal | Transactions directes, sans pratiques douteuses      |
| ⚡ Simplicité      | Trouver ou publier un bien en 2 clics max            |
| 🏡 Modernité       | UX propre, mobile-first, supérieure aux concurrents |

**À éviter absolument :**

* Ton luxe ostentatoire / "bling"
* Sur-promesse
* UI surchargée

---

## 2. Design System

### Direction visuelle

**Style :** Minimaliste · Calme · Élégant mais accessible · Inspiré de la lumière naturelle et du bâti réel


// this is my opinion you can use your own system if you find these are not aligning with good ssystem desing intructions

### Palette de couleurs (CSS Variables)

```css
:root {
  /* Primaires */
  --color-primary:     #2C6E49;   /* Vert forêt doux — confiance, éthique */
  --color-primary-light: #52B788;
  --color-primary-dark:  #1B4332;

  /* Neutres */
  --color-bg:          #FAFAF8;   /* Blanc cassé, chaleureux */
  --color-surface:     #FFFFFF;
  --color-border:      #E8E8E3;
  --color-muted:       #9B9B8E;

  /* Texte */
  --color-text:        #1A1A18;
  --color-text-secondary: #5C5C52;

  /* Accent */
  --color-accent:      #D4A853;   /* Or doux — discret, pas bling */

  /* Feedback */
  --color-success:     #52B788;
  --color-error:       #E05A4F;
}
```

### Typographie

```css
/* Display / Headings */
font-family: 'Playfair Display', serif;   /* ou 'DM Serif Display' */

/* Body / UI */
font-family: 'DM Sans', sans-serif;       /* ou 'Nunito' */

/* Arabic fallback */
font-family: 'Cairo', sans-serif;
```

### Spacing & Radius

```css
--radius-sm:   6px;
--radius-md:   12px;
--radius-lg:   20px;
--radius-xl:   32px;

--shadow-card: 0 2px 16px rgba(0,0,0,0.06);
--shadow-hover: 0 8px 32px rgba(0,0,0,0.10);
```

### Principes UI

* Mobile-first en priorité absolue
* Aucune friction inutile
* Hiérarchie visuelle claire — 1 action principale par écran
* Micro-interactions légères (hover, focus, transition)
* Pas de gradients criards — ombres douces seulement

---

## 3. Architecture Technique

### Frontend

| Outil                | Usage                   |
| -------------------- | ----------------------- |
| Next.js (App Router) | Framework principal     |
| Tailwind CSS         | Styling                 |
| React Query          | Data fetching / cache   |
| Zustand              | State management léger |
| Framer Motion        | Animations              |

### Backend

| Outil                 | Usage                       |
| --------------------- | --------------------------- |
| Laravel               | API REST + Admin backend    |
| Sanctum               | Authentification            |
| PostgreSQL + PostGIS  | DB principale + géospatial |
| Meilisearch           | Recherche full-text         |
| S3 (ou Cloudflare R2) | Upload & stockage images    |
| Google Maps API       | Carte interactive           |

### Conventions fichiers (Next.js App Router)

```
/app
  /page.tsx                  → Landing
  /acheter/page.tsx          → Listing vente
  /louer/page.tsx            → Listing location
  /bien/[id]/page.tsx        → Product page
  /publier/page.tsx          → Ajouter un bien
  /dashboard/page.tsx        → Espace client
  /admin/...                 → Admin panel (Phase 1 — dernière étape)
/components
  /ui                        → Boutons, inputs, badges, cards…
  /layout                    → Navbar, Footer
  /listing                   → Filtres, Cards, Map
  /property                  → Galerie, Infos, Contact sticky
  /dashboard                 → Forms, Stats
/lib
  /api.ts                    → Appels API centralisés
  /hooks                     → Custom hooks
  /utils                     → Helpers
```

---

## 4. Phase 1 — Frontend Roadmap

> L'admin panel est la **dernière étape** de la Phase 1.

### Ordre de développement

```
[ ] 1. Design System & composants UI de base
        → Palette, typo, boutons, inputs, badges, cards shell

[ ] 2. Layout global
        → Navbar (desktop + mobile)
        → Footer

[ ] 3. Landing Page
        → Hero + Search Bar
        → Navigation rapide (par type / localisation)
        → Section Valeurs
        → Section "3 étapes"
        → CTA Propriétaires
        → Section Confiance

[ ] 4. Listing Page — Grid View
        → Filtres principaux (sidebar ou top bar)
        → Cards produits avec swipe photos
        → Filtres avancés (dialog)
        → Tri

[ ] 5. Listing Page — Map View
        → Split view : cards à gauche / carte à droite
        → Sync hover card ↔ pin carte
        → Filtres identiques

[ ] 6. Product Page
        → Galerie immersive (carousel + thumbs)
        → Infos clés + description
        → Équipements
        → Map embed
        → Contact sticky (Call / WhatsApp / Formulaire)

[ ] 7. Auth (Google OAuth)
        → Login / Register pages
        → Middleware de protection de routes

[ ] 8. Espace Client (Dashboard)
        → Liste des biens + statuts
        → Vues & contacts
        → Flow "Ajouter un bien" (6 étapes, progress bar)

[ ] 9. Admin Panel  ← DERNIÈRE ÉTAPE PHASE 1
        → Gestion utilisateurs
        → Modération annonces
        → Statistiques globales
        → Featured properties
        → Gestion catégories
```

---

## 5. Navigation & Structure

### Menu principal

```
Vente
  ├── Appartements
  ├── Terrains
  ├── Villas
  ├── Maisons
  └── Locaux commerciaux

Location
  ├── Appartements
  ├── Bureaux
  ├── Villas
  ├── Maisons
  └── Locaux commerciaux
```

### URL pattern suggéré

```
/acheter                        → Listing vente (tous types)
/acheter/appartements           → Listing filtré
/acheter/appartements/tunis     → Listing filtré + ville
/louer                          → Listing location
/bien/[slug-id]                 → Product page
/publier                        → Ajouter un bien (auth requis)
/dashboard                      → Espace client (auth requis)
/admin                          → Admin (rôle admin requis)
```

---

## 6. Landing Page

### Sections & ordre

#### 1. Hero

* Image immersive (maison familiale, lumière naturelle, pas de luxe)
* **Titre :** "Trouvez votre logement en toute confiance, simplement"
* **Sous-titre :** "Une plateforme immobilière éthique, sans intermédiaires complexes."
* **Search bar :**
  * Toggle Vente / Location
  * Type de bien (dropdown)
  * Localisation (autocomplete)
  * Bouton "Rechercher"

#### 2. Navigation rapide (blocs visuels cliquables)

```
📍 Par localisation          🏠 Par type de bien        💰 Opportunités
─────────────────────        ─────────────────────       ───────────────
Explorer à Tunis             Appartements                Bonnes affaires
Maisons à Hammamet           Villas                      Biens récents
Explorer à Sfax              Maisons
                             Locaux commerciaux
```

#### 3. Section Valeurs

| Icône | Titre               | Description                                     |
| ------ | ------------------- | ----------------------------------------------- |
| 🤝     | Transparence totale | Informations claires, sans ambiguïté          |
| 🕌     | Approche éthique   | Transactions directes, sans pratiques douteuses |
| ⚡     | Simplicité         | Trouvez ou publiez un bien rapidement           |

#### 4. Section "Comment ça marche" (3 étapes)

1. **Recherchez** — Utilisez les filtres pour cibler votre bien
2. **Consultez** — Toutes les infos en un coup d'œil
3. **Contactez** — Directement avec le propriétaire

> "Une expérience pensée pour aller à l'essentiel."

#### 5. Section Inspiration

* Biens mis en avant (maisons familiales, biens bien situés)
* Ton réaliste + aspiration mesurée (pas de luxe)

#### 6. CTA Propriétaires

> "Vous avez un bien à vendre ou à louer ?"
> **[Publier mon bien gratuitement]**
> "Simple, rapide et sans complexité"

#### 7. Section Confiance

* `X` biens disponibles
* `X` utilisateurs
* Engagement qualité

#### 8. Footer

* Navigation rapide (Vente, Location, Publier)
* Liens légaux (CGU, Confidentialité)
* Contact
* Rappel des valeurs

---

## 7. Listing Page

### Deux vues disponibles (switch visible)

#### Grid View

```
[Filtres — top bar ou sidebar]
┌──────────┐  ┌──────────┐  ┌──────────┐
│  Card 1  │  │  Card 2  │  │  Card 3  │
└──────────┘  └──────────┘  └──────────┘
```

#### Map View (Split)

```
┌─────────────────────┬──────────────────┐
│  Cards (scrollable) │   Carte Google   │
│  ← gauche           │   → droite       │
│  hover sync ↔       │   pin highlight  │
└─────────────────────┴──────────────────┘
```

### Property Card — contenu

* **Photos** : carousel swipeable directement sur la card
* **Badge** : Nouveau / Promo / Exclusif
* **Prix** bien visible (gras, primaire)
* **Localisation** (ville + quartier)
* **Type** (Appartement, Villa…)
* **État** : Neuf / Ancien
* **Courte description** (1 ligne max)
* **Critères clés** : 🛏 chambres · 🚿 SDB · 📐 surface m²

### Filtres

**Principaux (toujours visibles)**

* Type de bien
* Localisation (autocomplete)
* Budget min / max (slider ou inputs)

**Avancés (dialog / drawer)**

* Surface (min / max)
* Chambres
* Salles de bain
* Étage
* État (neuf / ancien)

**Critères lifestyle**

* Ascenseur
* Garage
* Terrasse
* Meublé
* 🕌 Proche d'une mosquée → ≤ 300m · ≤ 500m · ≤ 1km *(logique distance-based PostGIS)*
* École
* Transports
* Commerces

**Tri**

* Plus récents
* Prix croissant / décroissant
* Surface

---

## 8. Product Page

### Structure

```
1. Galerie immersive
   └── Carousel principal + thumbnails en bas
   └── Bouton "Toutes les photos" (lightbox)

2. Infos clés (au-dessus du fold)
   ├── Prix
   ├── Localisation (lien Google Maps)
   ├── Surface
   ├── Chambres
   ├── Salles de bain
   └── Badge (Neuf / Ancien / Exclusif)

3. Description
   └── Texte complet du propriétaire

4. Équipements & Critères
   └── Liste visuelle (icons + labels)

5. Map (embed Google Maps)
   └── Localisation approximative ou exacte

6. Contact (STICKY sidebar desktop / bottom bar mobile)
   ├── 📞 Appeler
   ├── 💬 WhatsApp
   └── ✉️ Formulaire rapide (nom, message, envoyer)
```

---

## 9. Espace Client (Dashboard)

### Dashboard — Vue principale

| Colonne  | Info                                 |
| -------- | ------------------------------------ |
| Bien     | Titre + photo miniature              |
| Statut   | Publié · Brouillon · En révision |
| Vues     | Compteur                             |
| Contacts | Compteur                             |
| Actions  | Éditer · Dépublier · Supprimer   |

### Flow "Ajouter un bien" — 6 étapes avec progress bar

```
Étape 1 — Type de bien
  ↳ Vente ou Location
  ↳ Catégorie (Appartement, Villa, Terrain…)

Étape 2 — Infos principales
  ↳ Titre, Prix, Surface, Chambres, SDB, État

Étape 3 — Photos
  ↳ Drag & drop
  ↳ Réordonnancement
  ↳ Min 3 photos recommandées

Étape 4 — Localisation
  ↳ Map picker (clic pour placer le pin)
  ↳ Adresse texte en fallback

Étape 5 — Options & Équipements
  ↳ Checkboxes des critères lifestyle
  ↳ Description libre

Étape 6 — Récapitulatif & Publication
  ↳ Aperçu de l'annonce
  ↳ [Publier] ou [Sauvegarder en brouillon]
```

---

## 10. Admin Panel

> ⚠️ Développé en **dernier** dans la Phase 1.

### Fonctionnalités

| Section         | Contenu                                               |
| --------------- | ----------------------------------------------------- |
| Tableau de bord | Stats globales (biens, users, contacts, vues)         |
| Annonces        | Liste + modération (approuver / rejeter / supprimer) |
| Utilisateurs    | Liste, rôles, suspension                             |
| Mise en avant   | Gérer les "featured properties"                      |
| Catégories     | Ajouter / modifier les types de biens et critères    |
| SEO             | Pages villes / types (Phase 3)                        |

### Accès

* Route protégée `/admin` — rôle `admin` uniquement
* Middleware Laravel + Next.js
* UI distincte du front public (layout séparé)

---

## Notes de développement

* **Auth :** Google OAuth via Sanctum (Phase 1) — email/password en fallback
* **Images :** Upload S3/R2, stocker les URLs en DB, pas de stockage local
* **Carte :** Google Maps JS API pour Map View + Product page embed
* **Proximité mosquée :** requête PostGIS `ST_DWithin` avec rayon paramétrable
* **i18n :** Prévoir Français / Arabe dès le départ (next-intl ou i18next) — même si AR est Phase 2
* **SEO :** Métadonnées dynamiques sur chaque bien (titre, description, OG image)
* **Mobile :** Tester sur 375px en priorité

---

*Dernière mise à jour : Phase 1 — Frontend first, Admin panel en clôture de phase.*
