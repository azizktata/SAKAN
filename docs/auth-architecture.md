# Auth Architecture — SAKAN

## Overview

SAKAN uses a **cookie-based BFF (Backend-for-Frontend) pattern**. The Laravel backend owns session state via an httpOnly `sakan_token` cookie. The Next.js frontend never handles raw tokens directly — it just reads a client-readable sentinel cookie (`sakan_token=1`) to know whether a session exists.

```
Browser
  │
  ├─── POST /api/auth/login  ──────────────────► Laravel (sets httpOnly sakan_token)
  │                                                       │
  │◄── { user } + Set-Cookie: sakan_token ────────────────┘
  │
  ├─── GET /api/auth/me (withCredentials) ─────► Laravel (reads httpOnly cookie)
  │◄── { id, name, email, role, … } ───────────┘
  │
  └─── Protected pages (/espace-client, /admin)
         │
         └─ Next.js middleware (proxy.ts) checks cookie presence → redirect if missing
```

---

## Key Files

| File | Role |
|---|---|
| [lib/api.ts](../lib/api.ts) | Axios instance + all API namespaces |
| [lib/auth-context.tsx](../lib/auth-context.tsx) | React context — `useAuth()` hook |
| [proxy.ts](../proxy.ts) | Next.js middleware — route protection |
| [app/auth/page.tsx](../app/auth/page.tsx) | Login / register UI |
| [app/auth/callback/page.tsx](../app/auth/callback/page.tsx) | Google OAuth landing page |

---

## Session Storage: Two Layers

The session state is held in two complementary places:

### 1. httpOnly Cookie (`sakan_token`)
Set by Laravel on login/OAuth. Never readable by JavaScript — used by the browser to authenticate every API request automatically (via `withCredentials: true` on the Axios instance).

### 2. `localStorage` (`sakan_user`)
The `User` object is cached in `localStorage` so the UI can render immediately without waiting for `GET /auth/me` to resolve on every page load. It is written by `writeLocalUser()` in `auth-context.tsx` and cleared on logout or a 401 response.

> **Why two layers?** The cookie authenticates API calls; localStorage gives instant UI hydration. They are kept in sync by `fetchMe()` on mount and cleared together on logout.

---

## Auth Context (`lib/auth-context.tsx`)

Wraps the entire app in `app/layout.tsx` via `<AuthProvider>`.

```ts
const { user, loading, logout, refresh, setUser } = useAuth()
```

| Value | Type | Description |
|---|---|---|
| `user` | `User \| null` | Currently authenticated user, or `null` |
| `loading` | `boolean` | `true` until first `GET /auth/me` resolves |
| `logout()` | `async () => void` | Calls `POST /auth/logout`, clears cookie + localStorage, redirects to `/` |
| `refresh()` | `async () => void` | Re-fetches `GET /auth/me` and updates state |
| `setUser()` | `(User \| null) => void` | Manually override user state (used after login/register) |

### Startup flow

```
AuthProvider mounts
  │
  ├─ readLocalUser()  ← synchronously pre-populates state from localStorage
  │
  └─ fetchMe()  ← async, validates session with the server
       ├─ 200 → setUser(res.data)  (update localStorage)
       ├─ 401 → setUser(null), clear sakan_token cookie  (definite expiry)
       └─ network error → keep localStorage user intact  (offline tolerance)
```

---

## Axios Instance (`lib/api.ts`)

```ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,   // always send cookies cross-origin
})
```

### 401 Interceptor

Automatically redirects to `/auth` on any 401 response **except**:
- `GET /auth/me` — handled by `AuthProvider` itself
- `POST /auth/login` and `POST /auth/register` — errors shown inline
- Property contact endpoints — contact form is public-ish

---

## Route Protection (`proxy.ts`)

Next.js middleware exported as `proxy` (named export — not the default `middleware` convention).

```ts
export const config = {
  matcher: ['/espace-client/:path*', '/admin/:path*'],
}
```

On every request to those paths:
1. Checks for the `sakan_token` cookie.
2. If missing → redirects to `/auth?redirect=<original-path>`.
3. If present → passes through.

> **Important:** This is a lightweight gate — it only checks cookie *presence*, not validity. Real authorization happens server-side in Laravel. Admin role enforcement (`user.role === 'admin'`) is done client-side in the admin layout as a secondary UX guard.

---

## Login / Register Flow (`app/auth/page.tsx`)

Both forms use `react-hook-form` + Zod validation. On success:

```ts
function afterAuth(user: User) {
  setUser(user)                                                       // 1. update context + localStorage
  document.cookie = 'sakan_token=1; path=/; max-age=86400; SameSite=Lax'  // 2. set client-readable sentinel
  window.location.href = redirect                                     // 3. hard-navigate (flushes middleware)
}
```

The `redirect` param comes from `?redirect=` set by the middleware, so users land back where they started.

---

## Google OAuth Flow

```
1. User clicks "Continuer avec Google"
2. authApi.googleRedirect()
     → window.location.href = NEXT_PUBLIC_API_URL + /auth/google/redirect
3. Laravel initiates OAuth with Google, handles callback
4. Laravel redirects browser to /auth/callback
5. app/auth/callback/page.tsx mounts, calls GET /auth/me
6. On success: sets user in context, writes sakan_token=1 sentinel, navigates to /espace-client
7. On failure: redirects to /auth
```

---

## User Roles

```ts
type UserRole = 'particulier' | 'agent' | 'admin'
```

| Role | Access |
|---|---|
| `particulier` | `/espace-client` — personal listings and contacts |
| `agent` | `/espace-client` — same as particulier (extended features planned) |
| `admin` | `/admin` — full platform management |

Role is stored on the `User` object and checked client-side in layout components. Server-side enforcement is handled by Laravel middleware.

---

## Logout Flow

```ts
logout = async () => {
  await authApi.logout()                          // POST /auth/logout (Laravel clears httpOnly cookie)
  setUser(null)                                   // clear context + localStorage
  document.cookie = 'sakan_token=; max-age=0'   // clear sentinel cookie
  window.location.href = '/'                     // full page reload to /
}
```

---

## Security Notes

- The httpOnly `sakan_token` set by Laravel is not accessible to JavaScript — XSS cannot steal it.
- The client-readable `sakan_token=1` sentinel is only used to avoid a round-trip in the middleware; it carries no secret.
- `SameSite=Lax` on the sentinel prevents CSRF for navigation-triggered requests.
- Cross-origin requests work because `withCredentials: true` is set and Laravel's CORS config must allow the Next.js origin with `supports_credentials: true`.
