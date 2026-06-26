import { ref } from 'vue'

// ── Types ─────────────────────────────────────────────────
export interface Option {
  id?: number
  slug: string
  name: string
}

export interface SearchOptions {
  destinations: Option[]   
  poolCategories: Option[] 
  ticketCategories: Option[]
}

// ── Static fallbacks ──────────────────────────────────────
const fallbackDestinations: Option[] = [
  { slug: 'سرعین', name: 'سرعین' },
  { slug: 'مشگین-شهر', name: 'مشگین شهر' },
  { slug: 'جزیره-کیش', name: 'جزیره کیش' },
  { slug: 'اصفهان', name: 'اصفهان' },
  { slug: 'شیراز', name: 'شیراز' },
  { slug: 'مشهد', name: 'مشهد' },
]

const fallbackPoolCategories: Option[] = [
  { id: 1, slug: 'استخر', name: 'استخر' },
  { id: 2, slug: 'ماساژ', name: 'ماساژ' },
  { id: 3, slug: 'پارک-آبی', name: 'پارک آبی' },
  { id: 4, slug: 'vip', name: 'خانوادگی(خصوصی)' },
]

const fallbackTicketCategories: Option[] = [
  { slug: 'اتاق-فرار', name: 'اتاق فرار' },
  { slug: 'شهربازی', name: 'شهربازی' },
  { slug: 'تفریح‌های-گروهی', name: 'تفریح‌های گروهی' },
  { slug: 'تله-سیژ-و-تله-کابین', name: 'تله سیژ و تله کابین' },
  { slug: 'باشگاه-بدن-سازی', name: 'باشگاه بدن سازی' },
  { slug: 'اسکیت', name: 'اسکیت' },
  { slug: 'ماساژ-و-اسپا', name: 'ماساژ و اسپا' },
]

// ── Module-level cache (survives component unmount/remount) ─
let cache: SearchOptions | null = null
let fetchPromise: Promise<SearchOptions> | null = null

const BASE = '/api'

async function fetchAll(): Promise<SearchOptions> {
    if (cache) return cache
  if (fetchPromise) return fetchPromise

  fetchPromise = (async () => {
    const [locRes, poolCatRes, ticketCatRes] = await Promise.allSettled([
      fetch(`${BASE}/pool/top-location-list`),
      fetch(`${BASE}/pool/category-list`),
      fetch(`${BASE}/ticket/category-list`),
    ])

    // ── destinations ─────────────────────────────────────
    let destinations = fallbackDestinations
    if (locRes.status === 'fulfilled' && locRes.value.ok) {
      try {
        const data = await locRes.value.json()
        const mapped: Option[] = (Array.isArray(data) ? data : [])
          .map((l: any) => ({ slug: l.slug, name: l.name }))
          .filter((l) => l.slug && l.name)
        if (mapped.length) destinations = mapped
      } catch { /* keep fallback */ }
    }

    // ── pool categories ───────────────────────────────────
    let poolCategories = fallbackPoolCategories
    if (poolCatRes.status === 'fulfilled' && poolCatRes.value.ok) {
      try {
        const data = await poolCatRes.value.json()
        const mapped: Option[] = (Array.isArray(data) ? data : [])
          .map((c: any) => ({ id: c.id, slug: c.slug, name: c.name }))
          .filter((c) => c.slug && c.name)
        if (mapped.length) poolCategories = mapped
      } catch { /* keep fallback */ }
    }

    // ── ticket categories (flatten children) ──────────────
    let ticketCategories = fallbackTicketCategories
    if (ticketCatRes.status === 'fulfilled' && ticketCatRes.value.ok) {
      try {
        const data = await ticketCatRes.value.json()
        const mapped: Option[] = []
        for (const parent of Array.isArray(data) ? data : []) {
          const children: any[] = parent.children ?? []
          if (children.length) {
            for (const child of children) {
              if (child.slug && child.name) mapped.push({ slug: child.slug, name: child.name })
            }
          } else if (parent.slug && parent.name) {
            mapped.push({ slug: parent.slug, name: parent.name })
          }
        }
        if (mapped.length) ticketCategories = mapped
      } catch { }
    }

    cache = { destinations, poolCategories, ticketCategories }
    return cache
  })()

  return fetchPromise
}

// ── Composable ────────────────────────────────────────────
export function useSearchOptions() {
  const options = ref<SearchOptions>({
    destinations: fallbackDestinations,
    poolCategories: fallbackPoolCategories,
    ticketCategories: fallbackTicketCategories,
  })
  const loading = ref(!cache)

  fetchAll().then((result) => {
    options.value = result
    loading.value = false
  })

  return { options, loading }
}
