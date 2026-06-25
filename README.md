# Asro: Vue SPA → Nuxt SSR Migration Roadmap

**Status:** Planning. Fresh Nuxt 4 project already created, needs config.
**Driver:** SEO/crawlability + social link previews (OG) + performance — all three.
**Deploy target:** New VPS / self-managed Node server (separate from Hirad's, TBC).
**Backend:** A different existing API (not Hirad's Rust/Axum) — details needed, see Open Items.
**Auth/cart/dashboard:** Stay dummy for this migration. Real backend wiring deferred to a later phase.

---

## 1. Current State (Vue 3 SPA)

- Vue 3 + Vite, `script setup lang="ts"`, Composition API, auto-imports
- `unplugin-vue-router` file-based routing
- DaisyUI v5, Lucide Vue Next, Vazirmatn font, RTL Persian
- `useHead` for SEO (never actually rendered pre-hydration since it's a pure SPA)
- Composable pattern: `useXxxMain → { data, seo, faqs, loading }`
- Theme: `asro_theme` in `localStorage`, `data-theme` on `<html>`
- Numerals via `toLocaleString('fa-IR')`
- Pages: `index`, `about/`, `contact/`, `hotel/{index,search,[slug]}`, `pool/{index,search,[slug]}`, `ticket/{index,search,[slug]}`, `blog/{index,[slug]}`, `place/travel-guide/[slug]/{index,search}`, `place/travel-to/[slug]/[id]`
- Auth/cart/dashboard: dummy, no real backend

## 2. Target State (Nuxt 4 SSR)

What carries over almost unchanged:
- Route structure (Nuxt's file-based `pages/` routing is a near-direct match for the current layout)
- DaisyUI v5 tokens, Vazirmatn, RTL conventions, Lucide icons
- `toLocaleString('fa-IR')` numerals (verify server-side ICU support)
- Null-guard discipline, layout (`px-4 lg:px-16` + `max-w-960`)

What has to change:
- `useXxxMain` composables' internals → `useFetch`/`useAsyncData` so data resolves server-side
- `asro_theme` → can't read `localStorage` during SSR; needs a cookie-based or client-only-guarded approach to avoid a flash of the wrong theme
- `useHead` → still works (auto-imported Nuxt composable), but now it actually matters since it's rendered into the initial HTML
- Route param casting via `unplugin-vue-router` types → Nuxt's `useRoute()` / `definePageMeta`
- API calls move from client-side `onMounted` fetches to server-side composables (need to decide what's exposed to the client vs kept server-only, e.g. API keys via `runtimeConfig`)

## 3. Migration Phases

### Phase 0 — Config foundation
- Nitro preset: `node-server` (matches VPS deployment)
- Tailwind + DaisyUI v5 module setup in `nuxt.config.ts`
- Vazirmatn font loading, RTL (`dir`/`lang` via `app.head` in config, not just `useHead` per-page)
- Lucide icons (Nuxt-friendly import path)
- ESLint/TS config parity with the old project
- `runtimeConfig` for the new API's base URL + any auth keys
- **Needs:** your current `nuxt.config.ts` + `package.json` to know what's already set up vs missing

### Phase 1 — Static/marketing pages
- `index`, `about/`, `contact/`
- Lowest risk, validates SSR rendering, RTL, theme toggle rewrite, build/deploy pipeline end-to-end before touching data-heavy pages

### Phase 2 — Theme SSR-safety
- Replace `localStorage`-only `asro_theme` read with a cookie (read server-side to set `data-theme` before send), keep `localStorage` in sync client-side for instant toggle feel

### Phase 3 — Listing & detail pages (data-driven)
- `hotel/*`, `pool/*`, `ticket/*`, `place/travel-guide/*`, `place/travel-to/*`
- Convert each `useXxxMain` to `useFetch`/`useAsyncData` against the new API
- Confirm search/pagination params re-fetch correctly on both full SSR load and client-side nav
- **Needs:** new API base URL, auth scheme (public / API key / bearer token), and whether it's reachable from wherever the new VPS lives

### Phase 4 — SEO
- `useSeoMeta`/`useHead` per page (now actually effective)
- Sitemap + `robots.txt` (e.g. `@nuxtjs/sitemap`)
- JSON-LD structured data per page type (hotel/tour/product schema)
- Verify OG image URLs are absolute (`resolveAssetUrl` output) for link previews

### Phase 5 — Blog
- `blog/{index,[slug]}` — simplest data shape, do after the harder listing pages are proven out

### Phase 6 — Auth/cart/dashboard (deferred)
- Port dummy pages as-is for now
- Real backend wiring is a separate future phase, not part of this migration

### Phase 7 — Deployment infra
- New VPS: nginx + systemd service, mirroring Hirad's `hirad-nuxt.service` pattern → e.g. `asro-nuxt.service`
- Domain (`asrotravel.com`), SSL via certbot
- Build/deploy script (build `.output`, ship to VPS, restart systemd)
- **Needs:** is this VPS brand new, or could it run alongside Hirad's VPS on a different port/nginx site?

### Phase 8 — Cutover & QA
- Redirects from old SPA URLs if any paths change
- Lighthouse/SEO crawl check, hydration mismatch check, RTL flash check
- Decommission old Vite SPA hosting once verified

## 4. Open Items Still Needed

1. **`nuxt.config.ts` + `package.json`** of the new project (or just describe what's already configured)
2. **New API details** — base URL, auth method (public/API key/bearer), reachable from the new VPS?
3. **VPS specifics** — brand new server, or sharing Hirad's VPS on a different port/site?
4. **URL/slug stability** — must old paths stay identical, or is restructuring OK?
5. **Existing SEO assets** — any sitemap/robots.txt/JSON-LD already in the SPA worth preserving exactly?