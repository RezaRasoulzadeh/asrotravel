// app/composables/useHotelSearch.ts
import type { 
  HotelCardItem, 
  HotelSearchFilters, 
  HotelSearchResponse, 
  HotelSortOption 
} from '~/types/hotel.types'
import { toGregorian } from '~/utils/date'

const parseDigits = (s: string) =>
  String(s ?? '').replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))

function jalaliToGregorian(jDate: string): string {
  const normalized = parseDigits(jDate)
  const parts = normalized.split('/')

  if (parts.length !== 3) return ''

  const jy = parseInt(parts[0] ?? '')
  const jm = parseInt(parts[1] ?? '')
  const jd = parseInt(parts[2] ?? '')

  if (isNaN(jy) || isNaN(jm) || isNaN(jd)) return ''

  return toGregorian(jy, jm, jd)
}

function parseNumberList(value: unknown): number[] {
  const raw = Array.isArray(value) ? value.join(',') : String(value ?? '')
  return cleanTerms(raw.split(',').map(Number).filter(Number.isFinite))
}

function cleanTerms(terms: number[] | undefined): number[] {
  return [...new Set(terms ?? [])].filter((t) => Number.isFinite(t) && t > 0)
}

export function buildHotelSearchQuery(f: HotelSearchFilters): Record<string, string> {
  const query: Record<string, string> = {}
  const terms = cleanTerms(f?.terms)

  if (f?.location != null && f.location !== '') query.location = f.location
  if (f?.name != null && f.name !== '') query.q = f.name
  if (terms.length > 0) query.terms = terms.join(',')
  if ((f?.page ?? 1) > 1) query.page = String(f.page)
  if (f?.sort != null && f.sort !== 'default') query.sort = f.sort
  if (f?.star_rate != null) query.star_rate = String(f.star_rate)
  
  if (f?.date_from != null) {
    const gDate = jalaliToGregorian(f.date_from)
    if (gDate !== '') query.date_from = gDate
  }

  if (f?.date_to != null) {
    const gDate = jalaliToGregorian(f.date_to)
    if (gDate !== '') query.date_to = gDate
  }
  
  if (f?.number != null) query.number = String(f.number)

  if (f?.min_price != null || f?.max_price != null) {
    query.amount = `${f?.min_price ?? ''},${f?.max_price ?? ''}`
  }

  return query
}

export function useHotelSearch() {
  const router = useRouter()
  const route = useRoute()

  const amountParam = route.query.amount as string | undefined
  const [urlMin, urlMax] = amountParam != null
    ? amountParam.split(',').map(Number)
    : [NaN, NaN]
    
  const urlTerms = parseNumberList(route.query.terms)
  const urlStarRate = route.query.star_rate != null
    ? Number(route.query.star_rate)
    : null
  const urlNumber = route.query.number != null ? Number(route.query.number) : undefined

const hotels = ref<HotelCardItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const totalPages = ref(0)
  const currentPage = ref(1)
  const perPage = ref(10)

  const filters = ref<HotelSearchFilters>({
    location: (route.query.location as string) ?? '',
    name: (route.query.q as string) ?? '',
    min_price: !isNaN(urlMin ?? NaN) ? urlMin : null,
    max_price: !isNaN(urlMax ?? NaN) ? urlMax : null,
    star_rate: urlStarRate,
    date_from: (route.query.date_from as string) ?? undefined,
    date_to: (route.query.date_to as string) ?? undefined,
    number: urlNumber,
    ...(urlTerms.length > 0 ? { terms: urlTerms } : {}),
    page: route.query.page != null ? Number(route.query.page) : 1,
    sort: (route.query.sort as HotelSortOption) ?? 'default',
  })

  function buildParams(f: HotelSearchFilters): Record<string, any> {
    const p: Record<string, any> = {}
    const terms = cleanTerms(f?.terms)

    if (f?.location != null && f.location !== '') p.location = f.location
    if (f?.name != null && f.name !== '') p.q = f.name
    if (terms.length > 0) p.terms = terms.join(',')
    if (f?.star_rate != null) p.star_rate = String(f.star_rate)

    if (f?.date_from != null || f?.date_to != null) {
      p.date = []
      if (f?.date_from != null) p.date.push(f.date_from)
      if (f?.date_to != null) p.date.push(f.date_to)
    }

    if (f?.number != null) p.number = String(f.number)
    p.page = String(f?.page ?? 1)

    if (f?.sort != null && f.sort !== 'default') p.sort = f.sort

    if (f?.min_price != null || f?.max_price != null) {
      const apiMin = (f?.min_price ?? 0) * 10
      const apiMax = (f?.max_price ?? 0) * 10
      if (apiMin > 0 || apiMax > 0) {
        p.amount = `${apiMin},${apiMax}`
      }
    }
    return p
  }

  function syncToUrl(f: HotelSearchFilters, replace = false) {
    const query = buildHotelSearchQuery(f)
    if (replace) router.replace({ query })
    else router.push({ query })
  }

  async function fetchHotels(f: HotelSearchFilters = filters.value) {
    loading.value = true
    error.value = null
    
    const params = buildParams(f)
    const query = new URLSearchParams()
    
    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        value.forEach(v => query.append(key, v))
      } else if (value != null) {
        query.set(key, value)
      }
    }

    const res = await safeApiFetch<HotelSearchResponse | null>(`/api/hotel/search-page?${query.toString()}`)
    
    if (res?.error != null) {
      error.value = res.error
      hotels.value = []
    } else {
      hotels.value = res?.data?.data ?? []
      total.value = res?.data?.total ?? 0
      totalPages.value = res?.data?.totalPages ?? 0
      currentPage.value = res?.data?.currentPage ?? 1
      perPage.value = res?.data?.perPage ?? 10
    }
    
    loading.value = false
  }

  function applyFilters(newFilters: Partial<HotelSearchFilters>) {
    filters.value = { ...filters.value, ...newFilters, page: 1 }

    const terms = cleanTerms(filters.value.terms)
    if (terms.length > 0) {
      filters.value.terms = terms
    } else {
      delete filters.value.terms
    }

    syncToUrl(filters.value)
    fetchHotels(filters.value)
  }

  function goToPage(page: number) {
    filters.value = { ...filters.value, page }
    syncToUrl(filters.value)
    fetchHotels(filters.value)
  }

  function resetFilters() {
    filters.value = { page: 1 }
    syncToUrl(filters.value)
    fetchHotels(filters.value)
  }

  fetchHotels(filters.value)

  return {
    hotels,
    loading,
    error,
    total,
    totalPages,
    currentPage,
    perPage,
    filters,
    fetchHotels,
    applyFilters,
    goToPage,
    resetFilters,
  }
}