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

`app/utils/api.ts`'s `SafeApiResult<T>` carries a `status: number | null` field (confirmed
applied). Composables branch on `result.status === 401`, not on parsing the error string.

## Auth

- Token + user live in `useCookie` (not localStorage) — SSR-safe.
- `app/middleware/auth.global.ts` guards every `/dashboard/*` route. No per-page
  middleware needed.
- Any composable that gets `status === 401` back (via `SafeApiResult.status`) calls
  `useAuth().handleSessionExpiry()` and stops. No exceptions.

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

Profile → My Wallet → Bookings (in progress) → My Favorites → Support → revisit dashboard
index/overview last.

## Bookings — current state (in progress)

- 3 tabs: **Pool (default)**, Hotel, Ticket.
- List UX for this feature specifically: **infinite scroll + expandable rows** showing
  detail/actions inline (not paged, not a separate detail page). This is a per-feature
  choice, not necessarily the project default — confirm UX per feature, don't assume.
- Actions included: rebook (link), review (link), **cancel (real action)**. Pay is
  **hidden entirely** until a working `/cart/[code]/payment` route exists.
- `dashboardBookings.types.ts` drafted: `PoolBooking` fully typed from a real sample.
  `HotelBooking`/`TicketBooking` are **stubbed as Pool-compatible shells, NOT confirmed** —
  do not trust their shape until real samples are provided.
- Legacy (pre-migration, Nuxt 2/Element Plus) reference component surfaced useful but
  **conflicting** info vs. the current sample response:
  - Old status enum: `unpaid/draft/error_payment/confirmed/paid/partial_payment`.
    Current sample shows `completed`/`expire`. Real current enum still unconfirmed.
  - Old `booking_meta.val` was a rich object (`date_display`, `time_display`,
    `reservation_code`, `created_ticket`). Current sample's `booking_meta.val` is just the
    string `"service"` — different shape. Whether `reservation_code`/QR data exists
    anywhere in the new payload is unconfirmed.
  - Old list filter param was `service`; current server route guesses `object_model`.
    Unconfirmed.
  - Old cancel call: `{ service: 'Pool', booking_id }` — real endpoint path unknown
    (backend is Node.js, not yet inspected).
- **Open blockers**, pending Reza pulling real data from the live site's Network tab (or
  the old frontend's `$api.cart` plugin source if still available):
  1. Real `status` enum + whether `reservation_code`/QR data exists in the payload
  2. Real list filter param name (`service` vs `object_model` vs other)
  3. Real cancel-booking endpoint path/payload
- Do not finalize `bookings.get.ts`, the composable's action-visibility logic, or the
  expandable detail panel until the above are confirmed — everything built so far for
  this feature is structurally sound but contains flagged guesses.

## Ask for files — every time, not just at the start

This doc records intent and shape, not literal current code. Before generating anything,
if the file you'd be extending, matching, or depending on isn't already pasted into the
chat, **ask Reza to paste it first** — don't reconstruct it from memory of this summary.
This applies to:
- Foundational files (`useAuth.ts`, `useToast.ts`, `server/utils/api.ts`,
  `app/middleware/auth.global.ts`) — already confirmed/pasted at least once.
- `server/utils/auth.ts` (`safeAuthApiFetch`) and `app/composables/usePrivateApiFetch.ts` —
  **did not exist** before this project; Claude drafted both from scratch in chat. Neither
  is confirmed-applied by Reza yet. Ask him to paste the current version (in case he edited
  the draft) before depending on either — don't assume the drafted version is what's live.
- The closest already-built dashboard file when adding a sibling feature
- Any page spec, API response sample, or component the user references but hasn't shown
- Anything where guessing the current shape risks silently drifting from it

Ask, get the file, then build.
