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

**Architecture decision (settled):** Nitro is the unified gateway for all data fetching, mirroring Hirad's pattern. Pages never call the real backend directly — they call Nitro server routes via `useFetch('/api/...')`, and those server routes do the actual fetch to the external API. This applies uniformly to both public (no-auth) and authenticated endpoints — the client bundle never sees the base URL or any credentials either way.

Example shape:
```
server/api/hotels/[slug].get.ts     → public, no auth, proxies to real API
server/api/hotels/search.get.ts     → public, no auth
server/api/contact.post.ts          → needs auth, key/token stays server-side
```
Whether each endpoint gets its own route file vs. a catch-all proxy route (like Hirad's `[...path].ts`) is a Phase 0 config decision once the real API's endpoint list and auth mechanism are known.

**Resolved:** per-endpoint route files, with clean client-facing names that don't need to mirror the upstream path — e.g. `server/api/home.get.ts` proxies to `utilities/getMainPage`, exposed to the app as `/api/home`. Each route stays a thin proxy (no data transforms server-side); shaping/transform logic stays in the composable's `useFetch` call, same as the SPA pattern.

## 3. Migration Phases

### Phase 0 — Config foundation
- Nitro preset: `node-server` (matches VPS deployment)
- Tailwind + DaisyUI v5 module setup in `nuxt.config.ts`
- Vazirmatn font loading, RTL (`dir`/`lang` via `app.head` in config, not just `useHead` per-page)
- `lucide-vue-next` for icons (same package as the SPA, works as-is with Nuxt auto-imports)
- ESLint/TS config parity with the old project
- `runtimeConfig` for the new API's base URL + any auth keys (server-side only, used inside Nitro routes)
- Decide Nitro route structure: per-endpoint files vs. a catch-all proxy route, once the real API's endpoint list is known
- **Needs:** your current `nuxt.config.ts` + `package.json` to know what's already set up vs missing

**Dependency checklist for Phase 0** (track here as each gets confirmed installed):
```bash
npm install -D tailwindcss @tailwindcss/vite daisyui @types/node
npm install lucide-vue-next
npx nuxi prepare
```

### Phase 1 — Static/marketing pages
- `index`, `about/`, `contact/`
- Lowest risk, validates SSR rendering, RTL, theme toggle rewrite, build/deploy pipeline end-to-end before touching data-heavy pages

### Phase 2 — Theme SSR-safety
- Replace `localStorage`-only `asro_theme` read with a cookie (read server-side to set `data-theme` before send), keep `localStorage` in sync client-side for instant toggle feel

### Phase 3 — Listing & detail pages (data-driven)
- `hotel/*`, `pool/*`, `ticket/*`, `place/travel-guide/*`, `place/travel-to/*`
- Convert each `useXxxMain` to `useFetch`/`useAsyncData` hitting Nitro server routes (`/api/...`), which in turn proxy/fetch to the real backend — auth or no auth, the page-level code looks the same either way
- Confirm search/pagination params re-fetch correctly on both full SSR load and client-side nav
- **Needs:** new API base URL, auth scheme for the protected endpoints (API key / bearer token / other), and roughly which endpoints need auth vs. not

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

## 5. Coding Conventions for This Migration

- Every file gets a filename comment as its first line — for `.vue` files, as the literal first line of the file, above `<script setup>`; for `.ts` files, as the literal first line. Use `~/...` for path aliases, not `@/...`.
- No other comments in code — no explanatory comments, no inline notes. Code should read clean; any explanation belongs in chat, not the file.

## 6. Open Items Still Needed

1. **`nuxt.config.ts` + `package.json`** of the new project (or just describe what's already configured)
2. **New API details** — base URL, auth method (public/API key/bearer), reachable from the new VPS?
3. **VPS specifics** — brand new server, or sharing Hirad's VPS on a different port/site?
4. **URL/slug stability** — must old paths stay identical, or is restructuring OK?
5. **Existing SEO assets** — any sitemap/robots.txt/JSON-LD already in the SPA worth preserving exactly?