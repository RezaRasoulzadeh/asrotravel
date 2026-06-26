import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { PoolItem, PoolSearchFilters, PoolSearchResponse } from '~/types/pool.types'

export function buildPoolSearchQuery(f: PoolSearchFilters): Record<string, string> {
  const query: Record<string, string> = {}
  const terms = cleanTerms(f.terms)
  if (f.category_id != null) query.category_id = String(f.category_id)
  if (f.location)            query.location    = f.location
  if (f.name)                query.q           = f.name
  if (terms.length)          query.terms       = terms.join(',')
  if ((f.page ?? 1) > 1)     query.page        = String(f.page)
  if (f.sort && f.sort !== 'default') query.sort = f.sort

  if (f.min_price != null || f.max_price != null) {
    query.amount = `${f.min_price ?? ''},${f.max_price ?? ''}`
  }

  return query
}

export function usePoolSearch() {
  const router = useRouter()
  const route  = useRoute()

  const amountParam = route.query.amount as string
  const [urlMin, urlMax] = amountParam ? amountParam.split(',').map((value) => Number(value)) : [NaN, NaN]
  const minPrice = typeof urlMin === 'number' && !Number.isNaN(urlMin) ? urlMin : null
  const maxPrice = typeof urlMax === 'number' && !Number.isNaN(urlMax) ? urlMax : null
  const urlTerms = parseNumberList(route.query.terms)

  // ── State ──────────────────────────────────────────────
  const pools       = ref<PoolItem[]>([])
  const loading     = ref(false)
  const error       = ref<string | null>(null)
  const total       = ref(0)
  const totalPages  = ref(0)
  const currentPage = ref(1)
  const perPage     = ref(10)

  // ── Filters ────────────────────────────────────────────
  const filters = ref<PoolSearchFilters>({
    category_id: route.query.category_id ? Number(route.query.category_id) : null,
    location:    (route.query.location  as string) || '',
    name:        (route.query.q         as string) || '',
    min_price:   minPrice,
    max_price:   maxPrice,
    ...(urlTerms.length ? { terms: urlTerms } : {}),
    page:        route.query.page       ? Number(route.query.page)       : 1,
    sort:        (route.query.sort      as any) || 'default', 
  })

  // ── Build API payload ──────────────────────────────────
  function buildParams(f: PoolSearchFilters): URLSearchParams {
    const p = new URLSearchParams()
    const terms = cleanTerms(f.terms)
    if (f.category_id != null) p.set('category_id', String(f.category_id))
    if (f.location)            p.set('location',    f.location)
    if (f.name)                p.set('q',           f.name)
    if (terms.length)          p.set('terms',       terms.join(','))
    p.set('page', String(f.page ?? 1))
    
    if (f.sort && f.sort !== 'default') {
      p.set('sort', f.sort)
    }
    
if (f.min_price != null || f.max_price != null) {
  const apiMin = (f.min_price ?? 0) * 10;
  const apiMax = (f.max_price ?? 0) * 10;
  if (apiMin > 0 || apiMax > 0) {
    p.set("amount", `${apiMin},${apiMax}`);
  }
}
    return p
  }

  // ── Sync to URL ────────────────────────────────────────
  function syncToUrl(f: PoolSearchFilters, replace = false) {
    const query = buildPoolSearchQuery(f)

    if (replace) router.replace({ query })
    else router.push({ query })
  }

  async function fetchSearchPage(f: PoolSearchFilters): Promise<PoolSearchResponse> {
  const params = buildParams(f)
  const { data, error } = await safeApiFetch<PoolSearchResponse>(`/api/pool/search?${params}`)
  if (error || !data) throw new Error(error || 'خطا در دریافت اطلاعات')
  return data
}

  // ── Fetch ──────────────────────────────────────────────
  async function fetchPools(f: PoolSearchFilters = filters.value) {
    loading.value = true
    error.value   = null
    try {
      const json = await fetchSearchPage(f)
      pools.value       = json.data        ?? []
      total.value       = json.total       ?? 0
      totalPages.value  = json.totalPages  ?? 0
      currentPage.value = json.currentPage ?? 1
      perPage.value     = json.perPage     ?? 10
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'خطا در دریافت اطلاعات'
    } finally {
      loading.value = false
    }
  }

  function applyFilters(newFilters: Partial<PoolSearchFilters>) {
    filters.value = { ...filters.value, ...newFilters, page: 1 }
    const terms = cleanTerms(filters.value.terms)
    if (terms.length) filters.value.terms = terms
    else delete filters.value.terms
    syncToUrl(filters.value)
    fetchPools(filters.value)
  }

  function goToPage(page: number) {
    filters.value = { ...filters.value, page }
    syncToUrl(filters.value)
    fetchPools(filters.value)
  }

  function resetFilters() {
    filters.value = { page: 1 }
    syncToUrl(filters.value)
    fetchPools(filters.value)
  }

  fetchPools(filters.value)

  return {
    pools,
    loading,
    error,
    total,
    totalPages,
    currentPage,
    perPage,
    filters,
    fetchPools,
    applyFilters,
    goToPage,
    resetFilters,
  }
}

function parseNumberList(value: unknown): number[] {
  const raw = Array.isArray(value) ? value.join(',') : String(value ?? '')
  return cleanTerms(raw
    .split(',')
    .map((item) => Number(item))
    .filter((item) => Number.isFinite(item)))
}

function cleanTerms(terms: number[] | undefined): number[] {
  return [...new Set(terms ?? [])].filter((term) => Number.isFinite(term) && term > 0)
}
