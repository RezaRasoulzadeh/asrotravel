# Asro — Nuxt 4 SSR Migration: Conventions Reference

You are assisting with migrating **Asro** (asrotravel.com) from a Vue 3 SPA to a Nuxt 4 SSR project. Persian RTL UI, DaisyUI v5, Tailwind, Lucide Vue Next, Vazirmatn font. Reza supplies one source file at a time and expects a complete converted output following the rules below — not partial diffs, not explanations baked into the code.

## Hard rules — no exceptions, ever

1. **Every backend request goes through Nitro. Always. Regardless of what the old SPA did.**
   The SPA fetched directly from the client for plenty of endpoints, including ones with no auth requirement. That pattern does not carry over — not even temporarily, not even for "simple" or "public" data. In the Nuxt app:
   - No page, component, or composable ever calls the upstream API (`api.asrotravel.com` or any other host) directly.
   - Every call goes: client composable → `/api/...` (relative, on the Nuxt server) → `server/api/**` Nitro route → upstream API.
   - When converting an old SPA composable that fetched directly, the conversion is not done until a matching Nitro route exists and the composable calls that instead. There is no valid intermediate state where a converted file still hits the upstream URL.

2. **Always null-guard. Always.**
   - Every value coming from an API response, a composable, or a route param must be guarded — `?.`, `??`, or an explicit `!= null` check before use.
   - Non-null assertion (`!`) is only ever allowed immediately after an explicit guard for that same value, never on its own.
   - This matters more than it did in the SPA: the server-side `safeApiFetch` now returns a `fallback` (usually `null` or `[]`) on **any** upstream failure, not just "no data." Every consumer must treat null/empty as a normal expected state, not an edge case to patch in later.

## Stack

- Nuxt 4, TypeScript, `script setup lang="ts"`, Composition API only, auto-imports (never manually import `ref`/`computed`/`watch`/etc.)
- DaisyUI v5 + Tailwind, Lucide Vue Next, Vazirmatn font, RTL Persian
- Nitro preset: `node-server` (VPS deploy: Node + nginx + systemd)
- `~/` alias only — never `@/`
- Numerals: always `toLocaleString('fa-IR')` (or fa-IR locale options) — scores, counts, dates, percentages, pagination, everything

## File conventions

- Filename comment as the literal first line of every file — above `<script setup>` for `.vue`, line 1 for `.ts`.
- No other comments anywhere — no inline notes, no explanatory comments. Explanation belongs in chat, not in the file.
- `encodeURIComponent` on every slug/param at **both** the composable layer and the Nitro layer.
- Template/markup is never touched during conversion — script/logic changes only, unless explicitly asked.

## The unified request pattern

Two `utils/api.ts` files, same filename, different layer, different contract — this is intentional, not a duplication bug.

**`app/utils/api.ts` (client)** — for composables that fetch imperatively (search/listing, anything with manual refetch or pagination). Never throws, always resolves `{ data, error }`:
```ts
export interface SafeApiResult<T> {
  data: T | null
  error: string | null
}

export async function safeApiFetch<T>(
  request: string,
  options?: Parameters<typeof $fetch>[1],
  fallbackMessage = 'خطا در دریافت اطلاعات',
): Promise<SafeApiResult<T>> {
  try {
    return { data: await $fetch<T>(request, options), error: null }
  } catch (error) {
    return { data: null, error: apiErrorMessage(error, fallbackMessage) }
  }
}
```

**`server/utils/api.ts` (server)** — used inside every Nitro route. Fail-soft: swallows upstream errors, returns a caller-supplied `fallback`, never `createError`:
```ts
export async function safeApiFetch<T>(
  path: string,
  options: FetchOptions = {},
  fallback: T,
): Promise<T> {
  try {
    return await $fetch<T>(apiUrl(path), { ...options, headers })
  } catch (error) {
    console.warn(`[api] ${path} failed`, error)
    return fallback
  }
}
```
Known open question: this collapses a real 404 and a 500/network error into the same flat `fallback`, so "not found" currently renders as an empty page rather than a true 404. Flag this if it comes up — not yet decided whether to special-case `createError({ statusCode: 404 })` for genuine not-found while keeping fail-soft for everything else.

### Two composable shapes — pick one, never invent a third

**1. Single-item / detail composables** — reactive `useFetch` straight to the Nitro route, keyed via `toValue`, `default: () => null`, response reshaped into `computed` getters:
```ts
export function useHotelSingle(slug: string | Ref<string>) {
  const { data, pending, error, refresh } = useFetch<HotelSingleResponse | null>(
    () => `/api/hotel/${encodeURIComponent(toValue(slug))}`,
    { key: () => `hotel-single-${toValue(slug)}`, default: () => null }
  )
  return {
    hotel: computed(() => data.value?.hotel ?? null),
    gallery: computed(() => data.value?.gallery ?? []),
    similar: computed(() => data.value?.related ?? []),
    seo: computed(() => data.value?.hotel?.seo ?? null),
    faqs: computed(() => data.value?.hotel?.faqs ?? []),
    loading: pending, error, refresh,
  }
}
```

**2. Search/listing composables** — own `ref` state for filters/results, an imperative `fetchX()` that calls the **client** `safeApiFetch`, filters synced to the URL via `router.replace`/`push`, self-triggers once on creation. Not `useFetch`-based — the manual pagination/filter/URL-sync needs an imperative trigger.

### Nitro route shape

```ts
// server/api/hotel/[slug].get.ts
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) return null
  return await safeApiFetch<HotelSingleResponse | null>(
    `/hotel/${encodeURIComponent(slug)}/single`, {}, null
  )
})
```
Thin proxy only — no data shaping server-side, that stays in the composable. Explicit fallback value every time.

## Known bugs / gotchas already solved — don't reintroduce

- Sequential `await useFetch(...)` calls lose Nuxt's unctx context — create all `useFetch` calls synchronously, resolve together via `Promise.all` if multiple are needed in one composable.
- `noUncheckedIndexedAccess` (TS strict) breaks bracket indexing on strings/arrays — use `.charAt()` etc., non-null assertion only after an explicit guard.
- Component double-prefixing: a file at `components/blog/BlogSidebar.vue` auto-registers oddly — rename to `components/blog/Sidebar.vue` style (folder already provides the prefix).
- `definePageMeta` replaces `defineOptions` for layout assignment.