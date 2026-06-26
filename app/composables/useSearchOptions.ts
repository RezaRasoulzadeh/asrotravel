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

async function fetchAll(): Promise<SearchOptions> {
    if (cache) return cache
  if (fetchPromise) return fetchPromise

  fetchPromise = (async () => {
    const [locRes, poolCatRes, ticketCatRes] = await Promise.allSettled([
      safeApiFetch<any[]>('/api/pool/top-location-list'),
      safeApiFetch<any[]>('/api/pool/category-list'),
      safeApiFetch<any[]>('/api/ticket/category-list'),
    ])

    // ── destinations ─────────────────────────────────────
    let destinations = fallbackDestinations
    if (locRes.status === 'fulfilled' && Array.isArray(locRes.value.data)) {
      const mapped: Option[] = locRes.value.data
        .map((l: any) => ({ slug: l?.slug, name: l?.name }))
        .filter((l) => l.slug && l.name)
      if (mapped.length) destinations = mapped
    }

    // ── pool categories ───────────────────────────────────
    let poolCategories = fallbackPoolCategories
    if (poolCatRes.status === 'fulfilled' && Array.isArray(poolCatRes.value.data)) {
      const mapped: Option[] = poolCatRes.value.data
        .map((c: any) => ({ id: c?.id, slug: c?.slug, name: c?.name }))
        .filter((c) => c.slug && c.name)
      if (mapped.length) poolCategories = mapped
    }

    // ── ticket categories (flatten children) ──────────────
    let ticketCategories = fallbackTicketCategories
    if (ticketCatRes.status === 'fulfilled' && Array.isArray(ticketCatRes.value.data)) {
      const mapped: Option[] = []
      for (const parent of ticketCatRes.value.data) {
        const children: any[] = parent?.children ?? []
        if (children.length) {
          for (const child of children) {
            if (child?.slug && child?.name) mapped.push({ slug: child.slug, name: child.name })
          }
        } else if (parent?.slug && parent?.name) {
          mapped.push({ slug: parent.slug, name: parent.name })
        }
      }
      if (mapped.length) ticketCategories = mapped
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

  fetchAll()
    .then((result) => {
      options.value = result
    })
    .finally(() => {
      loading.value = false
    })

  return { options, loading }
}
