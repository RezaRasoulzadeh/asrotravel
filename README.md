# Asro Travel — Project Context & Scheme

> Source: reverse-engineered directly from `github.com/RezaRasoulzadeh/asrotravel` (public repo, current `main`).
> Existing `README.md` / `DASHBOARD.md` / `checkout.md` in the repo are flagged as **stale** — this doc supersedes them.
> Last synced: 2026-07-06 (booking-flow audit added, see §11).

---

## 1. What this project is

Asro (asrotravel.com) is a Persian-language (RTL) travel booking platform covering four product types — **hotel**, **pool** (سالن استخر / sports hall bookings), **ticket** (سانس/دربیس-style timed sessions), and **place** (destination/travel-guide content) — plus a blog and a customer dashboard for managing bookings.

**This was migrated from a Vue 3 + Vite SPA to Nuxt 4 SSR.** That migration is the single most important architectural fact for this project: every page now goes through a server-rendered, two-hop fetch pattern (browser → Nuxt server route → real backend), not a direct SPA → API call.

---

## 2. Stack

| Layer | Technology |
|---|---|
| Framework | **Nuxt 4.4** (SSR, `node-server` nitro preset) |
| UI | Vue 3.5, `vue-router` 5 |
| Styling | **Tailwind CSS 4** (via `@tailwindcss/vite`, CSS-first `@theme`/`@plugin` config — not `tailwind.config.js`) |
| Component kit | **DaisyUI 5** (`@plugin "daisyui"` in CSS, themes: `light` default / `dark` prefersdark) |
| Icons | `lucide-vue-next` |
| Font | Vazirmatn (self-hosted woff2, 400/500/600/700) |
| Realtime | `socket.io-client` (booking payment status) |
| Composition utilities | `@vueuse/nuxt` module |
| Language | TypeScript, `strict: true` |
| Locale | `lang="fa"`, `dir="rtl"` set globally in `nuxt.config.ts` |

No Pinia, no state library — global reactive state uses Nuxt's `useState`, and persistent client state uses `useCookie` (not localStorage — this matters, see §7).

---

## 3. Directory map

```
asrotravel/
├── app/                        # Nuxt 4 app/ dir (client + universal code)
│   ├── app.vue                 # root shell: NuxtLayout > NuxtPage + ToastContainer
│   ├── error.vue               # global error page (RTL, DaisyUI styled)
│   ├── router.options.ts       # scroll behavior override
│   ├── assets/
│   │   ├── css/main.css        # Tailwind 4 + DaisyUI theme tokens, keyframes, utility classes
│   │   ├── css/blog.css        # blog typography
│   │   └── images/             # logo-light.svg, logo-dark.svg
│   ├── layouts/                # default.vue, blank.vue, dashboard.vue
│   ├── pages/                  # file-based routes (Nuxt native, NOT unplugin-vue-router anymore)
│   ├── components/             # see §5 component tree
│   ├── composables/            # see §6
│   ├── types/                  # per-domain *.types.ts
│   └── utils/                  # price.ts, date.ts, jalali.ts, api.ts, blog/
├── server/                     # Nitro server (BFF layer)
│   ├── api/                    # one file per backend-proxying endpoint (see §4)
│   └── utils/                  # api.ts, auth.ts, dashboardBookings.ts — Nitro auto-imported
├── public/                     # static assets, hero images, fonts, favicon
├── nuxt.config.ts
├── package.json
└── tsconfig.json
```

---

## 4. The fetch architecture (BFF pattern) — read this first

This is the part most likely to trip up new work, so it gets its own section.

### 4.1 Two separate `safeApiFetch` functions — do not confuse them

There are **two different, same-named helpers**. They are not interchangeable and live in different runtimes.

**Client-side** — `app/utils/api.ts`:
```ts
export interface SafeApiResult<T> {
  data: T | null
  error: string | null
  status: number | null
}

export async function safeApiFetch<T>(
  request: string,
  options?: Parameters<typeof $fetch>[1],
  fallbackMessage = 'خطا در دریافت اطلاعات',
): Promise<SafeApiResult<T>>
```
- Always resolves (never throws).
- Returns a `{data, error, status}` envelope.
- `error` is a **user-facing Persian string**, already resolved via `apiErrorMessage()`.
- Used from composables calling **internal Nuxt routes** (`/api/...`), not the external backend directly.

**Server-side** — `server/utils/api.ts`:
```ts
export async function safeApiFetch<T>(
  path: string,
  options: FetchOptions = {},
  fallback: T,
): Promise<T>
```
- Returns the **raw fallback value itself** on failure (not an envelope) — e.g. `null`, `[]`, or a default object.
- Swallows errors and just logs `console.warn`.
- Used inside `server/api/*` route handlers to call the **real external API** (`apiUrl(path)` → `https://api.asrotravel.com/api/...`).

There's also `safeAuthApiFetch` (server-only, `server/utils/auth.ts`) — same shape but reads the `asro_token` cookie server-side, attaches `Authorization: Bearer`, and **throws a 401 `createError`** if the token is missing or the backend returns 401 (it does not silently fall back on auth failure, only on other errors).

### 4.2 The request path for a typical page

```
Page/component
   → composable (useHotelSingle, usePoolMain, ...)
      → useFetch('/api/hotel/[slug]')      ← Nuxt internal route, SSR-friendly
         → server/api/hotel/[slug].get.ts
            → safeApiFetch(path, {}, fallback)   ← server/utils/api.ts
               → real backend: https://api.asrotravel.com/api/hotel/{slug}/single
```

Public/read composables use **`useFetch`** directly against the internal `/api/...` route (SSR data fetching, dedup by `key`). Example (`useHotelSingle.ts`):
```ts
const { data, pending, error, refresh } = useFetch<HotelSingleResponse | null>(
  () => `/api/hotel/${encodeURIComponent(toValue(slug))}`,
  { key: () => `hotel-single-${toValue(slug)}`, default: () => null }
)
```

Mutating / authenticated / client-only flows (dashboard bookings, cancel, cart add, booking creation) instead call the client `safeApiFetch` / `usePrivateApiFetch` directly with `$fetch`-style semantics rather than `useFetch`, since they're user-triggered, not route-driven.

### 4.3 `usePrivateApiFetch` — the private/authenticated wrapper

```ts
// app/composables/usePrivateApiFetch.ts
export async function usePrivateApiFetch<T>(request, options?, fallbackMessage?) {
  const result = await safeApiFetch<T>(request, options, fallbackMessage)
  if (result.error) {
    if (result.status === 401) {
      await useAuth().handleSessionExpiry()
      return result
    }
    useToast().error(result.error)
  }
  return result
}
```
Use this (not raw `safeApiFetch`) for any action that should **auto-toast on error and auto-redirect-to-login on 401**. Read-only `useFetch`-based composables handle 401 manually inline instead (see `useCheckout.ts`, `useDashboardBookings.ts`).

### 4.4 Server route conventions

- One file per endpoint, named by HTTP verb suffix: `[slug].get.ts`, `add.post.ts`, `[id]/cancel.post.ts`.
- Nearly all are thin proxies: extract params → `safeApiFetch(path, options, fallback)` → return.
- `apiUrl(path)` (server/utils/api.ts) prefixes `runtimeConfig.apiBase` (`https://api.asrotravel.com/api` by default, overridable via `API_BASE_URL` env var).
- Server utils are **Nitro auto-imported** — never `import` them explicitly from `~/server/...` inside a handler.
- `readBody` is used directly for fixed-shape POST bodies; `safeReadBody(event)` exists as a defensive variant that always resolves to an object even on parse failure — used only where body shape is uncertain.

### 4.5 Realtime — booking payment status

`useBookingStatus.ts` connects a raw `socket.io-client` (not proxied through Nitro) directly to `https://api.asrotravel.com/booking_check`, client-only (`onMounted` + `import.meta.client` guard). It manages:
- `booking_status` event → parses returned HTML fragment (`extractPrimaryMessage`, client-only DOMParser) for the human-readable status, drives a countdown timer, and exposes `accessToPaid` to gate the payment button.
- `panel_booking_status` → routed straight to `useToast().error(...)`.
- Emits `end_booking_time_for_pay` when the countdown hits zero.

---

## 5. Component tree

```
app/components/
├── blog/
│   ├── BlogRenderer.vue        # renders parsed blog HTML (uses utils/blog/parser.ts)
│   └── Sidebar.vue
├── cart/
│   ├── CartDetail.vue
│   ├── CartSteps.vue
│   ├── CheckoutBookingSummary.vue
│   └── CheckoutSummary.vue
├── dashboard/
│   ├── BookingCard.vue
│   ├── BookingsList.vue
│   ├── BookingsTabs.vue
│   └── MiniCalendar.vue
├── home/
│   ├── DestinationList.vue
│   ├── HeroSearch.vue
│   ├── NewPostsList.vue
│   └── TopPostsList.vue
├── hotel/
│   ├── HotelCard.vue / HotelList.vue
│   ├── HotelPolicySection.vue
│   ├── HotelRoomsSection.vue
│   ├── HotelSingleHeader.vue
│   └── SearchCard.vue
├── place/
│   ├── CategoryGrid.vue
│   ├── PlaceSearchCard.vue
│   └── ProvinceHero.vue
├── pool/
│   ├── PoolCard.vue / PoolList.vue
│   ├── PoolPolicySection.vue
│   ├── PoolSanseCalendar.vue / VipSanseCalendar.vue / VipSanseSecion.vue
│   ├── PoolSearchCard.vue
│   └── PoolSingleHeader.vue
├── ticket/
│   ├── SearchCard.vue
│   ├── TicketCard.vue / TicketList.vue
│   ├── TicketSanseCalendar.vue
│   └── TicketSingleHeader.vue
└── ui/
    ├── FAQ.vue
    ├── FullscreenImageViewer.vue
    ├── GuestCountPicker.vue
    ├── LoadingState.vue
    ├── PersianDateRangePicker.vue
    ├── ToastContainer.vue
    ├── review/ReviewSecion.vue      
    └── spacer/
        ├── FeaturesList.vue
        ├── HowItWorks.vue
        └── TestimonialQuote.vue
```

**Naming/import note:** components auto-register with Nuxt's folder-prefixed convention, e.g. `app/components/dashboard/MiniCalendar.vue` → `<DashboardMiniCalendar />` (confirmed in use in `layouts/dashboard.vue`).

### Page tree (routes)

```
/                                   pages/index.vue
/about                              pages/about/index.vue
/contact                            pages/contact/index.vue
/blog, /blog/[slug]
/hotel, /hotel/search, /hotel/[slug]
/pool, /pool/search, /pool/[slug]
/ticket, /ticket/search, /ticket/[slug]
/place/travel-guide/[slug], /place/travel-guide/[slug]/search
/place/travel-to/[slug]/[id]        slug = ename (place lookup), id = numeric review object_id
/cart/detail
/cart/checkout/[code]               booking code, drives useCheckout + useBookingStatus
/login
/dashboard, /dashboard/bookings     dashboard layout
```

Layouts: `default` (public site), `dashboard` (customer panel — sidebar nav, mobile bottom nav, theme toggle), `blank`.

---

## 6. Composables reference

| Composable | Purpose | Fetch style |
|---|---|---|
| `useAuth` | cookie-based session (`asro_token`, `asro_user`), OTP login, `handleSessionExpiry()` | client `safeApiFetch` |
| `useToast` | global toast queue via `useState('toasts')` | — |
| `useHomeData`, `useHotelMain`, `usePoolMain`, `useTicketMain` | landing/list data for each vertical | `useFetch` |
| `useHotelSearch`, `usePoolSearch`, `useTicketSearch`, `usePlaceSearch` | search-page state + results | `useFetch` |
| `useHotelSearchAttributes`, `usePoolSearchAttributes`, `useTicketSearchAttributes`, `usePlaceSearchAttributes` | filter option metadata for search pages | `useFetch` |
| `useHotelSingle`, `usePoolSingle`, `useTicketSingle`, `useProvinceGuide` | single-item detail pages | `useFetch` |
| `useHotelRooms` | room list/pricing for a hotel | `useFetch` |
| `usePoolSanse`, `useTicketSanse` | timeslot/session ("sanse") data for pool/ticket single pages | `useFetch` |
| `useBlog`, `useBlogSide`, `useBlogSingle` | blog list, sidebar, single post | `useFetch` |
| `useReviews` | review list + submission | mixed |
| `useSearchOptions` | shared search widget option state (guests, dates, etc.) | — |
| `useJalaliDates` | Jalali calendar helpers for date pickers | — |
| `useDashboardBookings` | dashboard bookings list: tabs, status filter, sort, search, incremental "load more" pagination, `cancelBooking()` | client `safeApiFetch` + `usePrivateApiFetch` |
| `useCreateBooking` | add-to-cart / create booking | raw `$fetch` + manual 401 handling |
| `useCheckout` | checkout page data by booking `code` | `useFetch`, manual 401 handling |
| `useBookingStatus` | live payment status via socket.io + countdown | raw socket.io-client |
| `usePrivateApiFetch` | authenticated wrapper: auto-toast + auto-redirect on 401 | wraps client `safeApiFetch` |

### `useDashboardBookings` behavior detail (most recently built feature)

- Two loading modes: **paged** (default — `newest` sort, no search) uses `loadMore()` / incremental pagination; switches to **fully-loaded** mode (`ensureFullyLoaded()`, loops all pages) automatically the moment a search term or non-default sort is applied (`needsFullData` computed), because search/sort must operate over the complete set.
- Uses a `generation` counter to invalidate in-flight requests when the tab/filter changes mid-fetch (prevents stale responses from overwriting newer state).
- `cancelBooking(code)` — **⚠️ open item**: comment in source flags that the endpoint is keyed by `code` (UUID) rather than internal numeric `id`, and that the exact path/param contract with the real backend is *unconfirmed*. Treat as unverified until checked against the actual API.

---

## 7. Conventions & redlines

These are the rules the codebase actually follows — deviate deliberately, not by accident.

1. **`script setup lang="ts"` + Composition API only.** No Options API anywhere observed.
2. **Auto-imports** — never manually import `ref`, `computed`, `watch`, `useFetch`, `useState`, etc. Nuxt auto-imports composables from `app/composables/` and utils from `app/utils/` too.
3. **Null-guard everything from the network.** Optional chaining (`?.`), nullish coalescing (`?? ''`/`?? null`), explicit `!= null` checks. Non-null assertion (`!`) only ever after an explicit guard, never as a shortcut.
4. **Persian numerals everywhere a number is displayed** — `toLocaleString('fa-IR')` (see `formatPrice`, which also does the rial→toman `/10` conversion and formats with `٫` as the thousands separator, matching Persian convention) or fa-IR locale options.
5. **`formatPrice()` (utils/price.ts) already divides by 10** (backend returns rial, UI shows toman) — never re-divide, and never call it on an already-converted number.
6. **RTL is global**, not per-component: `htmlAttrs: { dir: 'rtl' }` in `nuxt.config.ts`, plus `html { direction: rtl }` in CSS as a belt-and-suspenders rule.
7. **Theme is a cookie, not localStorage** — `asro_theme` (`'light' | 'dark'`), read via `useCookie` in `app.vue`/`error.vue`/`layouts/dashboard.vue`, applied as `data-theme` on `<html>` via `useHead`. This is SSR-safe (cookie is readable server-side, avoiding theme flash) — do not swap this for `localStorage` or `window.matchMedia` without also handling SSR hydration.
8. **Toasts are global app state**, not per-component — `useToast()` backs onto `useState('toasts', ...)`, so any composable/component can push a toast and `<UiToastContainer />` (mounted once in `app.vue`) renders it.
9. **Error/empty state pattern** is consistent across list components (`HotelList`, `PoolList`, `TicketList`, `ReviewSecion`, etc.):
   - Loading → skeleton cards (`animate-pulse`, matching card shape).
   - Error → `WifiOff` icon in `bg-error/10` circle, title + `text-base-content/50` subtitle, `btn-sm btn-error btn-soft` retry button calling `execute()`/`refresh()`.
   - Empty → `SearchX` icon in `bg-base-200` circle, same text pattern, **no button**.
   - Both wrapped in `flex-col items-center justify-center py-16 gap-3 text-center px-4`.
10. **Component naming typo preserved:** `ui/review/ReviewSecion.vue` (missing "t") — this is load-bearing (imported/auto-registered under this name), don't "fix" it without a repo-wide rename + import check.
11. **`is_vip` derivation for pool** (`pages/pool/[slug].vue`): `ticket === 0 && vip > 0`, computed from the counts of keys in `services.ticket` / `services.vip` objects returned by the sanse endpoint.
12. **Two safe-fetch helpers, one name, different files/behavior** — see §4.1. Always check which file you're in before assuming the return shape.
13. **Route params always cast explicitly** where dynamic — pattern seen in `place/travel-to/[slug]/[id].vue`: slug is the entity lookup key (`ename`), `id` is the numeric key used for review `object_id`.
14. **No inline explanatory comments in generated code** (project-wide rule from your own conventions) — only a file-path header comment as the first line, and TODO comments. Explanations belong in chat, not the file.

### Known unresolved / in-progress items

- `useDashboardBookings.cancelBooking()` — endpoint contract unconfirmed (see §6 detail above).
- `pages/pool/[slug].vue` → `handleAddToCart()` — **this note is stale, corrected in §11.** As of 2026-07-06 the flow *is* wired to `useCreateBooking()` → `POST /api/booking/cart/add`, but a full audit found several bugs in it (see §11.2). `main` still has the original, unfixed code as of this writing.
- `README.md`, `DASHBOARD.md`, `checkout.md` in the repo are explicitly flagged by you as stale — don't trust their content; this doc was built by reading source directly instead.

---

## 8. Design tokens (Tailwind 4 / DaisyUI 5, CSS-first config)

Config lives entirely in `app/assets/css/main.css` — there is **no `tailwind.config.js`** (Tailwind 4 style: `@import "tailwindcss"`, `@plugin "daisyui" { themes: light --default, dark --prefersdark; }`, `@theme { ... }`).

| Token | Light | Dark |
|---|---|---|
| `--color-primary` | `oklch(62.54% 0.108 209.39)` (teal-blue) | `oklch(71.15% 0.121 200.32)` |
| `--color-secondary` | `oklch(60.6% 0.25 292.717)` | `oklch(70.2% 0.183 293.541)` |
| `--color-base-100` | `oklch(100% 0 0)` | `oklch(22% 0.01 240)` |
| `--color-base-200` | `oklch(96% 0 0)` | `oklch(19% 0.01 240)` |
| `--color-base-300` | `oklch(91% 0 0)` | `oklch(16% 0.01 240)` |
| `--color-error` | `oklch(64% 0.246 16.439)` | same |
| `--radius-box` | `2rem` | `2rem` |
| `--radius-btn` | `1rem` | `1rem` |

Custom keyframes/animations: `field-in` (staggered form-field entrance via `--fi` CSS var), `hero-reveal` (scale+fade for hero images), `card-rise` (translateY+fade for card grids). Utility classes: `.card-lift` (hover translateY + shadow, dark-mode shadow variant), `.select-custom`, `.hero-overlay`, `.no-scrollbar`, `.input`/`.btn` radius overrides.

Font: Vazirmatn, self-hosted `/fonts/*.woff2`, weights 400/500/600/700, `font-display: swap`.

---

## 9. Types reference

`app/types/`: `blog.types`, `blogSingle.types`, `cart.types`, `checkout.types`, `dashboardBookings.types`, `hotel.types`, `hotelSingle.types`, `place.types`, `placeSingle.types`, `pool.types`, `poolSingle.types`, `province.types`, `review.types`, `ticket.types`, `ticketSingle.types`.

`dashboardBookings.types.ts` exports `BookingSortOption`, `BookingStatus`, `BookingTab`, `DashboardBookingDto`, `DashboardBookingsDtoResponse`, and a `BOOKING_STATUS_LABELS` map (Persian status labels, used to optimistically patch UI after cancel).

`app/utils/`: `api.ts` (client `SafeApiResult`/`safeApiFetch`/`apiErrorMessage`), `price.ts` (`formatPrice`), `date.ts` + `jalali.ts` (Jalali↔Gregorian conversion, hand-rolled algorithm — no external date library), `blog/parser.ts` + `blog/types.ts` (blog HTML parsing via `htmlparser2`).

---

## 10. Things a new task should check before assuming

- **Which `safeApiFetch` am I in?** — client (`~/utils/api.ts`) vs server (`~~/server/utils/api.ts`). Import path context tells you; behavior differs completely.
- **Is this composable `useFetch`-based (SSR, cached by key) or raw `$fetch`-based (client-triggered action)?** Determines whether 401 handling is automatic or must be added manually.
- **Does the target page already have a real backend endpoint**, or is it one of the still-stubbed dashboard nav items (`/dashboard/profile`, `/dashboard/my-wallet`, `/dashboard/my-favorites`, `/dashboard/support` are linked in the sidebar but no corresponding `pages/dashboard/*` files exist yet beyond `index.vue` and `bookings.vue`).
- **Persian RTL + Jalali dates + toman formatting** apply to *any* new page touching dates or prices — don't reach for a new date/currency library, use the existing `utils/date.ts`/`utils/jalali.ts`/`utils/price.ts`.

---

## 11. VIP pool booking — payload contract

`POST /api/booking/cart/add` with `service_type: 'vip'` has a field-to-meaning mapping that isn't obvious from names alone. There are three distinct numeric IDs in play, and mixing them up produces a 500 (`Cannot read properties of null (reading 'isBookable')`) because the backend does a lookup that fails silently into a null:

| ID | Meaning | Where it comes from |
|---|---|---|
| `service_id` (top level of the payload) | The VIP room's `pool_id` — a mid-level grouping, not the venue and not the session variant | `VipSanseService.pool_id` (the `service` prop on `VipSanseCalendar.vue`) |
| `service.id` / `service.service_id` (nested) | The specific session/sans variant (e.g. "1.5-hour family session") | The slot itself (`VipChangeDateSlot.service_id`) |
| `parent.id` | The venue-level `Pool.id` | `aggregatedData.id` on `pages/pool/[slug].vue` |

Other payload requirements:

- `start_date`/`end_date` are required, both at the top level and nested inside `service`, formatted as `"YYYY-MM-DD H:mm"` — no `T` separator, no timezone offset, no leading zero on the hour (e.g. `"2026-07-08 9:00"`). Built via `toBackendDateTime()` in `VipCartDetail.vue`.
- `date`/`display_date` are sent as empty strings for VIP bookings. The backend's "selected date must be after this moment" validation is keyed off `start_date`, not `date`.
- `parent.title`/`parent.slug` (venue title/slug) are required alongside `parent.id`.

**State hand-off**: the calendar step and `/cart/vip-detail` communicate via `useState('vip-checkout-slot', ...)`, not `window.history.state` — Nuxt's `navigateTo` does not reliably forward a `state` option into `history.pushState`, so anything read back via `window.history.state` on the next page can silently come back `undefined`. The ticket/pool flow (`checkout-slot` key) uses the same pattern for the same reason.

**Error surfacing**: `server/api/booking/cart/add.post.ts` uses `authApiFetch()` (`server/utils/auth.ts`), not `safeAuthApiFetch()`. The latter swallows backend errors into a generic fallback (used by `checkout.get.ts`, `bookings.get.ts`, `cancel.post.ts`, where a swallowed fallback is fine); `authApiFetch()` re-throws the real backend `statusCode`/`message`/`data`, which matters here because cart/add is a user-triggered mutation where the real validation reason needs to reach the client. Don't consolidate these two helpers — the swallow-vs-surface behavior is intentional in both places.

**Pricing**: VIP rooms are priced flat per session (`service.price_per_sans` minus `service.offer`), not per adult. `service_features.guest_capacity` is the headcount included in that flat price; `service_features.price_per_person` is the fee for each guest beyond it, computed client-side in `VipCartDetail.vue` and passed through `useState` as `includedGuestCapacity`/`pricePerPerson` alongside `guestCapacity` (the hard cap on the headcount stepper, from `max_guest_capacity`).

The checkout response (`GET /api/booking/{code}/checkout`) carries `booking.deposit` separately from `booking.total` — only the deposit is charged online through the payment gateway; the remainder is collected at the venue. `CheckoutSummary.vue`/`CheckoutBookingSummary.vue` branch on `service.service_type === 'vip'` to show this breakdown, since the ticket-flow checkout response has a different shape (`origin_price_display`, no `deposit` concept) — see `checkout.types.ts`'s `CheckoutService` for both shapes.

The ticket/pool (non-VIP) booking flow does not follow this same `service_id`/`parent` contract — it has its own, separately verified working payload shape in `CartDetail.vue`/`PoolSanseCalendar.vue`. Don't port the VIP field mapping over to it.


TODO: update the checkout flow, it should add to cart if it was from dashboard or direct url in background fetch its response and show in chekout. it will done to always fetch updated prices. 
TODO: disable wishlist for now. remove from dashboard menu and disable page(do not remove)
TODO: referral logic for new add cart and checkouts. 
TODO: video in blog renderer. 