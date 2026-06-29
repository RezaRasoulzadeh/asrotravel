# Asro Dashboard — System Prompt

Nuxt 4 SSR, TypeScript, DaisyUI v5, RTL Persian, Vazirmatn. Hotel/Pool/Ticket/Place/Blog/Auth
are already migrated. This governs everything new under `/dashboard/*`.

## The one rule that overrides everything

**The browser never talks to `api.asrotravel.com` directly.** Every request goes:
`page/component → composable → Nuxt /api/... route (Nitro) → external API`

Two different `safeApiFetch` functions exist, in two different scopes — never mix them up:
- `server/utils/api.ts` (`safeApiFetch`) / `server/utils/auth.ts` (`safeAuthApiFetch`) —
  called ONLY inside `server/api/**` handlers, hits the external API.
- `app/utils/api.ts` (`safeApiFetch`) — called ONLY inside composables, hits our own
  `/api/...` routes.

Public domains use the plain server helper. Anything under `/dashboard` uses
`safeAuthApiFetch`, which reads the auth cookie and rethrows a real 401 instead of
swallowing it into the fallback.

## Auth

- Token + user live in `useCookie` (not localStorage) — SSR-safe.
- `app/middleware/auth.global.ts` guards every `/dashboard/*` route. No per-page
  middleware needed.
- Any composable that gets `status === 401` back calls `useAuth().handleSessionExpiry()`
  and stops. No exceptions.

## Toast

- `useToast()` + `<UiToastContainer />` (mounted once in `app.vue`).
- **Action** composables (POST/PUT/DELETE) call `useToast().error(...)` directly on failure.
- **Read/list** composables do NOT toast on failure — set a local error ref, page shows the
  existing inline error/empty state (`WifiOff`/`SearchX` pattern). 401 check happens first
  regardless of read or action.
- Action error → toast. Load error → inline state. Never both for the same failure.

## File header

Literal first line of every file = its real path, `app/` prefix included except for
`server/`:
```
// app/composables/useDashboardProfile.ts
// server/api/dashboard/profile.get.ts
```

## Per-feature file order

1. `app/types/dashboard<Feature>.types.ts`
2. `server/api/dashboard/<feature>.<method>.ts` — via `safeAuthApiFetch`
3. `app/composables/useDashboard<Feature>.ts` — read: plain `safeApiFetch` + inline error;
   action: `usePrivateApiFetch`
4. `app/components/dashboard/<Feature>*.vue`
5. `app/pages/dashboard/<route>.vue`

## Build order

Profile → My Wallet → Bookings → My Favorites → Support → revisit dashboard
index/overview last.

## Ask for files — every time, not just at the start

This doc records intent and shape, not literal current code. Before generating anything,
if the file you'd be extending, matching, or depending on isn't already pasted into the
chat, **ask Reza to paste it first** — don't reconstruct it from memory of this summary.
This applies to:
- Foundational files (`useAuth.ts`, `useToast.ts`, `usePrivateApiFetch.ts`,
  `server/utils/auth.ts`, `app/middleware/auth.global.ts`)
- The closest already-built dashboard file when adding a sibling feature
- Any page spec, API response sample, or component the user references but hasn't shown
- Anything where guessing the current shape risks silently drifting from it

Ask, get the file, then build.