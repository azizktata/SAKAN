
# SAKAN — Auth + Client Dashboard + Admin Dashboard Plan

## Architecture Overview

**Séparation stricte frontend / backend.**

Laravel est la seule source de vérité (auth, data, business logic).

Next.js est un client pur — il ne touche jamais la DB directement.

```
Next.js (web)          Mobile app (future)
       ↓                       ↓
       ↓   Bearer token (Sanctum opaque)
       ↓                       ↓
    Laravel API (Sanctum + Socialite + business logic)
              ↓
         PostgreSQL
```

---

## Stack

### Backend

| Outil               | Usage                                        |
| ------------------- | -------------------------------------------- |
| Laravel             | API REST — auth + business logic            |
| Laravel Sanctum     | API tokens — web + mobile                   |
| Laravel Socialite   | Google OAuth (consommateur, pas fournisseur) |
| PostgreSQL OR MySQL | Base de données principale                  |
|                     |                                              |
| Cloudflare R2       | Stockage images (S3-compatible)              |

### Frontend

| Outil                | Usage                                   |
| -------------------- | --------------------------------------- |
| Next.js (App Router) | UI web                                  |
| axios                | Appels API HTTP                         |
| Gestion token        | httpOnly cookies — jamais localStorage |

---

## Pourquoi Sanctum et pas Passport

Passport est un serveur OAuth2 — utile quand des **applications tierces** ont besoin de s'authentifier via SAKAN. Ce n'est pas le cas ici.

SAKAN a besoin de :

* Émettre des tokens pour ses propres clients (web + mobile)
* Consommer Google OAuth pour ses propres users (via Socialite — indépendant du choix Sanctum/Passport)

Sanctum couvre exactement ça, avec beaucoup moins de complexité.

---

## Gestion des tokens — Stratégie retenue

**httpOnly cookies posés par Next.js** (BFF pattern léger).

Le browser ne touche jamais le token directement. Next.js reçoit le token de Laravel, le pose en cookie httpOnly, et l'injecte dans chaque requête API via `withCredentials`.

```
Browser              Next.js                      Laravel API
   |                         |                         |
   |-- POST /api/auth/login ->|                         |
   |                         |-- POST /auth/login ----->|
   |                         |<-- { access_token }      |
   |<- Set-Cookie:           |                         |
   |   sakan_token=...       |                         |
   |   (httpOnly, Secure)    |                         |
   |                         |                         |
   |-- appel API client ---->|                         |
   |   (axios withCredentials)|-- Authorization: Bearer->|
   |<-- données -------------|<-- données --------------|
```

### Cookie posé

| Cookie          | Contenu              | Options                                         |
| --------------- | -------------------- | ----------------------------------------------- |
| `sakan_token` | Opaque token Sanctum | httpOnly · Secure · SameSite=Strict · Path=/ |

> Sanctum gère les tokens avec une durée d'expiration configurable.
>
> Pas besoin de refresh token séparé pour le web — le token est révoqué au logout.
>
> Pour la **mobile app future** : les tokens seront émis et stockés côté app native (pas de cookie).

---

## Packages à installer

### Frontend (Next.js)

```bash
npm install axios
npm install zod
npm install react-hook-form @hookform/resolvers
npm install browser-image-compression
```

Pas de Prisma. Pas de NextAuth. Pas de Passport.

---

## Base de données (Laravel)

### Table créée automatiquement par Sanctum

```
personal_access_tokens   ← la seule table ajoutée (vs 5 tables avec Passport)
```

---

## Laravel — Routes API (`routes/api.php`)

### Auth

```php
Route::prefix('auth')->group(function () {
    // Email / password
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login',    [AuthController::class, 'login']);
    Route::post('logout',   [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('me',        [AuthController::class, 'me'])->middleware('auth:sanctum');

    // Google OAuth
    Route::get('google/redirect', [SocialAuthController::class, 'redirect']);
    Route::get('google/callback', [SocialAuthController::class, 'callback']);
});
```

### Properties

```php
Route::get('properties',      [PropertyController::class, 'index']);  // public
Route::get('properties/{id}', [PropertyController::class, 'show']);   // public

Route::middleware('auth:sanctum')->group(function () {
    Route::post('properties',        [PropertyController::class, 'store']);
    Route::patch('properties/{id}',  [PropertyController::class, 'update']);
    Route::delete('properties/{id}', [PropertyController::class, 'destroy']);
    Route::get('user/properties',    [PropertyController::class, 'myProperties']);
    Route::get('user/contacts',      [ContactController::class, 'myContacts']);
    Route::patch('user/me',          [UserController::class, 'update']);
    Route::get('upload/presign',     [UploadController::class, 'presign']);
});
```

### Admin

```php
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('properties',         [AdminPropertyController::class, 'index']);
    Route::patch('properties/{id}',  [AdminPropertyController::class, 'update']);
    Route::delete('properties/{id}', [AdminPropertyController::class, 'destroy']);
    Route::get('users',              [AdminUserController::class, 'index']);
    Route::patch('users/{id}',       [AdminUserController::class, 'update']);
});
```

---

## Laravel — AuthController (email / password)

```php
class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:8|confirmed',
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => bcrypt($data['password']),
        ]);

        return $this->issueTokenResponse($user);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!auth()->attempt($credentials)) {
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

        return $this->issueTokenResponse(auth()->user());
    }

    public function logout(Request $request): JsonResponse
    {
        // Révoquer uniquement le token courant
        $request->user()->currentAccessToken()->delete();

        return response()
            ->json(['message' => 'Déconnecté'])
            ->cookie(Cookie::forget('sakan_token'));
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private function issueTokenResponse(User $user): JsonResponse
    {
        // Révoquer les anciens tokens web (optionnel — évite l'accumulation)
        $user->tokens()->where('name', 'sakan-web')->delete();

        $token = $user->createToken('sakan-web')->plainTextToken;

        return response()
            ->json(['user' => $user])
            ->cookie(
                'sakan_token',          // nom
                $token,                  // valeur
                60 * 24 * 30,           // durée (minutes) — 30 jours
                '/',                    // path
                null,                   // domain
                true,                   // secure (HTTPS only)
                true,                   // httpOnly
                false,                  // raw
                'strict'                // sameSite
            );
    }
}
```

---

## Laravel — SocialAuthController (Google OAuth)

```php
class SocialAuthController extends Controller
{
    public function redirect(): RedirectResponse
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function callback(): RedirectResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            return redirect(config('app.frontend_url') . '/auth?error=google_failed');
        }

        // Trouver ou créer l'utilisateur
        $user = User::updateOrCreate(
            ['google_id' => $googleUser->getId()],
            [
                'name'     => $googleUser->getName(),
                'email'    => $googleUser->getEmail(),
                'avatar'   => $googleUser->getAvatar(),
                'provider' => 'google',
                'password' => null,
            ]
        );

        // Révoquer anciens tokens web + émettre un nouveau
        $user->tokens()->where('name', 'sakan-web')->delete();
        $token = $user->createToken('sakan-web')->plainTextToken;

        // Redirect vers le frontend avec le cookie posé
        return redirect(config('app.frontend_url') . '/?auth=success')
            ->cookie('sakan_token', $token, 60 * 24 * 30, '/', null, true, true, false, 'strict');
    }
}
```

### Flow Google OAuth complet

```
User clique "Continuer avec Google"
  → window.location = https://api.sakan.tn/api/auth/google/redirect
  → Socialite redirige vers accounts.google.com
  → User accepte
  → Google callback → GET /api/auth/google/callback
  → Laravel : crée/trouve le user, émet le token Sanctum, pose le cookie
  → Redirect vers https://sakan.tn/?auth=success
  → Next.js layout détecte ?auth=success → authApi.me() → user connecté
```

### `config/services.php`

```php
'google' => [
    'client_id'     => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect'      => env('APP_URL') . '/api/auth/google/callback',
],
```

---

## Laravel — Middleware rôles

```php
// app/Http/Middleware/CheckRole.php
public function handle(Request $request, Closure $next, string $role): Response
{
    if ($request->user()?->role !== $role) {
        return response()->json(['message' => 'Accès refusé'], 403);
    }
    return $next($request);
}
```

Enregistré dans `bootstrap/app.php` :

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->alias(['role' => CheckRole::class]);
})
```

**Rôles disponibles :**

| Rôle           | Accès                                        |
| --------------- | --------------------------------------------- |
| `particulier` | Publier et gérer ses propres biens           |
| `agent`       | Idem + badge "Agent" visible sur ses annonces |
| `admin`       | Tout + panel `/admin`                       |

---

## Next.js — `lib/api.ts`

```ts
import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL, // https://api.sakan.tn/api
  withCredentials: true,                    // envoie le cookie httpOnly automatiquement
  headers: { 'Content-Type': 'application/json' },
})

// Intercepteur : 401 → redirect /auth
// (pas de refresh token séparé avec Sanctum — le token dure 30 jours)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/auth'
    }
    return Promise.reject(error)
  }
)

export default api

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register:       (data: RegisterPayload) => api.post('/auth/register', data),
  login:          (data: LoginPayload)    => api.post('/auth/login', data),
  logout:         ()                      => api.post('/auth/logout'),
  me:             ()                      => api.get<User>('/auth/me'),
  googleRedirect: () => {
    // Redirection navigateur directe — pas axios — pour le flow OAuth
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/redirect`
  },
}

// ── Properties ────────────────────────────────────────────────────────────────
export const propertiesApi = {
  list:       (params?: PropertyFilters) => api.get<Property[]>('/properties', { params }),
  get:        (id: string)               => api.get<Property>(`/properties/${id}`),
  create:     (data: PropertyPayload)    => api.post<Property>('/properties', data),
  update:     (id: string, data: Partial<PropertyPayload>) => api.patch(`/properties/${id}`, data),
  delete:     (id: string)               => api.delete(`/properties/${id}`),
  myList:     ()                         => api.get<Property[]>('/user/properties'),
  myContacts: ()                         => api.get<Contact[]>('/user/contacts'),
}

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadApi = {
  presign: (filename: string, contentType: string) =>
    api.get<{ signedUrl: string; publicUrl: string }>('/upload/presign', {
      params: { filename, contentType },
    }),
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminApi = {
  properties:     (params?: AdminFilters) => api.get('/admin/properties', { params }),
  updateProperty: (id: string, data: object) => api.patch(`/admin/properties/${id}`, data),
  deleteProperty: (id: string)               => api.delete(`/admin/properties/${id}`),
  users:          ()                         => api.get('/admin/users'),
  updateUser:     (id: string, data: object) => api.patch(`/admin/users/${id}`, data),
}
```

> L'intercepteur est simplifié par rapport à la version Passport — pas de retry refresh token.
>
> Sanctum avec une expiration de 30 jours rend le refresh transparent pour l'utilisateur.
>
> Si le token expire (rare), il est redirigé vers `/auth` pour se reconnecter.

---

## Next.js — `lib/auth-context.tsx`

```tsx
'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { authApi } from '@/lib/api'

type AuthContextType = {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true, logout: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Vérifie la session au chargement — cookie envoyé automatiquement
    authApi.me()
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    await authApi.logout()
    setUser(null)
    window.location.href = '/'
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

Dans `app/layout.tsx` :

```tsx
<AuthProvider>{children}</AuthProvider>
```

---

## Next.js — `middleware.ts`

```ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const hasToken = req.cookies.has('sakan_token')

  if (!hasToken) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = '/auth'
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/espace-client/:path*', '/admin/:path*'],
}
```

> Présence du cookie = accès autorisé côté Next.js.
>
> La **validité réelle** est vérifiée par Sanctum à chaque appel Laravel.
>
> Token expiré ou révoqué → Laravel répond 401 → intercepteur axios redirect `/auth`.

---

## Variables d'environnement

### `.env` Laravel

```env
APP_KEY=
APP_URL=https://api.sakan.tn
FRONTEND_URL=https://sakan.tn

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=sakan
DB_USERNAME=
DB_PASSWORD=

# Google OAuth (Google Cloud Console)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cloudflare R2
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=sakan
R2_PUBLIC_URL=https://cdn.sakan.tn
```

> Pas de `PASSPORT_*` ni de `JWT_SECRET` — Sanctum n'en a pas besoin.

### `.env.local` Next.js

```env
NEXT_PUBLIC_API_URL=https://api.sakan.tn/api
```

`next.config.ts` :

```ts
images: {
  remotePatterns: [
    { hostname: 'cdn.sakan.tn' },
    { hostname: 'lh3.googleusercontent.com' }, // avatars Google
  ],
}
```

---

## CORS (`config/cors.php`)

```php
'paths'                => ['api/*'],
'allowed_origins'      => ['https://sakan.tn', 'http://localhost:3000'],
'allowed_methods'      => ['*'],
'allowed_headers'      => ['*'],
'supports_credentials' => true, // indispensable pour les cookies cross-domain
```

---

## Upload images — Flow R2

1. User dépose des fichiers → compression `browser-image-compression` (max 1600px, WebP)
2. `GET /api/upload/presign?filename=...&contentType=image/webp` → `{ signedUrl, publicUrl }`
3. `PUT` fichier compressé directement vers R2 via `signedUrl` — browser → R2, sans passer par Laravel
4. Sauvegarder `publicUrl` dans le form state du wizard
5. À la soumission : tableau `images` avec les `publicUrl` envoyé dans `POST /api/properties`

---

## Phase A — UIs (statiques d'abord)

```
[ ] 1.  components/ui/dialog.tsx                   Modale réutilisable
[ ] 2.  components/publish/publish-dialog.tsx       Shell wizard + step controller
        components/publish/step-1-type.tsx
        components/publish/step-2-location.tsx
        components/publish/step-3-details.tsx
        components/publish/step-4-amenities.tsx
        components/publish/step-5-images.tsx
        components/publish/step-6-review.tsx
[ ] 3.  Tous les boutons "Publier un bien" → ?publish=open
[ ] 4.  components/auth/nav-user-menu.tsx           Navbar auth-aware
[ ] 5.  Update navbar
[ ] 6.  app/espace-client/layout.tsx + sidebar
[ ] 7.  app/espace-client/page.tsx                  Stats mock
[ ] 8.  app/espace-client/annonces/page.tsx         Mock properties
[ ] 9.  app/espace-client/contacts/page.tsx
[ ] 10. app/espace-client/profil/page.tsx
[ ] 11. app/admin/ pages + components               ← DERNIÈRE ÉTAPE PHASE 1
```

**Step 0 — Auth dans la dialog :**

* Si `user === null` : afficher "Connectez-vous pour publier"
* Bouton "Continuer avec Google" → `authApi.googleRedirect()`
* Lien alternatif → `/auth?redirect=/?publish=open`
* Après login → redirect vers `/?publish=open` → dialog se rouvre au step 1

---

## Phase B — Wiring réel

```
[ ] 12. php artisan sanctum:install + migrations
[ ] 13. Seeders : locations, amenities, admin user
[ ] 14. AuthController (register, login, logout, me)
[ ] 15. SocialAuthController (Google redirect + callback)
[ ] 16. lib/auth-context.tsx + AuthProvider dans layout
[ ] 17. middleware.ts Next.js
[ ] 18. lib/api.ts complet
[ ] 19. PropertyController + routes
[ ] 20. Remplacement mock data dans tous les composants
[ ] 21. Upload R2 (UploadController Laravel + step-5-images.tsx)
[ ] 22. AdminController + routes admin
[ ] 23. Middleware role:admin
```

---

## Structure fichiers

```
/app
  /auth/page.tsx                      Login + Register + bouton Google
  /espace-client/
    layout.tsx                        Auth guard
    page.tsx                          Dashboard overview
    annonces/page.tsx
    annonces/[id]/modifier/page.tsx
    contacts/page.tsx
    profil/page.tsx
  /admin/
    layout.tsx                        Auth guard + role check
    page.tsx
    annonces/page.tsx
    utilisateurs/page.tsx
  /page.tsx                           Landing
  /acheter/page.tsx
  /louer/page.tsx
  /bien/[id]/page.tsx
  layout.tsx                          AuthProvider + PublishDialog listener

/components
  /auth/
    nav-user-menu.tsx
  /publish/
    publish-dialog.tsx
    step-0-auth.tsx ... step-6-review.tsx
  /espace-client/
    sidebar.tsx
    property-card-manage.tsx
    stats-card.tsx
    contacts-list.tsx
  /admin/
    admin-sidebar.tsx
    properties-table.tsx
    users-table.tsx
  /ui/
    dialog.tsx · button.tsx · badge.tsx ...
  /layout/
    navbar.tsx · footer.tsx

/lib
  api.ts                              Axios instance + fonctions typées
  auth-context.tsx                    AuthProvider + useAuth

/middleware.ts                        Protection /espace-client + /admin
```

---

## Vérification finale

* [ ] Click "Publier un bien" → dialog ouvre
* [ ] Non connecté → step 0 avec bouton Google + lien `/auth`
* [ ] Google OAuth → callback → cookie posé → user connecté
* [ ] Register / login email → cookie posé → user connecté
* [ ] Connecté → steps 1–6, bien sauvegardé en brouillon
* [ ] Navbar : "Espace client" visible si connecté, caché sinon
* [ ] `/espace-client` → redirect `/auth` si non connecté
* [ ] `/admin` → 403 si rôle ≠ admin
* [ ] Token expiré / révoqué → redirect `/auth` automatique
* [ ] Upload → R2 via presigned URL, URL publique enregistrée en DB
* [ ] `npm run build` sans erreurs TypeScript

---

*Architecture : Laravel Sanctum + Socialite · Pas de Prisma · Pas de NextAuth · Pas de Passport · Pas de tymon*

*Token Sanctum opaque — httpOnly cookie — jamais localStorage*
