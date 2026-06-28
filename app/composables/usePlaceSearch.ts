// composables/usePlace.ts
import type {
  PlaceSearchItem,
  PlaceSearchResponse,
  PlaceSearchFilters,
} from '~/types/place.types'
import type { PlaceSingleProfile } from '~/types/placeSingle.types'

export function usePlace(slug: string | Ref<string>) {
  const { data, pending, error, refresh } = useFetch<PlaceSingleProfile | null>(
    () => `/api/place/${encodeURIComponent(toValue(slug))}`,
    {
      key: `place-single-${toValue(slug)}`,
      default: () => null
    }
  )

  return {
    place: computed(() => data.value),
    loading: pending,
    error,
    refresh
  }
}

export function usePlaceSearch() {
  const places = ref<PlaceSearchItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const total = ref(0)
  const totalPages = ref(1)
  const currentPage = ref(1)

  const filters = ref<PlaceSearchFilters>({ page: 1 })

  let requestId = 0

  async function fetchPlaces(overrides?: Partial<PlaceSearchFilters>) {
    if (overrides) {
      filters.value = { ...filters.value, ...overrides }
    }

    const id = ++requestId
    loading.value = true
    error.value = null

    const params = new URLSearchParams()
    if (filters.value.location) params.set('location', filters.value.location)
    if (filters.value.cat) params.set('cat', filters.value.cat)
    if (filters.value.sort && filters.value.sort !== 'default') params.set('sort', filters.value.sort)
    params.set('page', String(filters.value.page ?? 1))

    const { data, error: fetchError } = await safeApiFetch<PlaceSearchResponse>(
      `/api/place/search?${params.toString()}`
    )

    if (id !== requestId) return

    loading.value = false

    if (fetchError) {
      error.value = fetchError
      places.value = []
      total.value = 0
      totalPages.value = 1
      return
    }

    places.value = data?.data ?? []
    total.value = data?.total ?? 0
    totalPages.value = data?.totalPages ?? 1
    currentPage.value = data?.currentPage ?? 1
  }

  function applyFilters(overrides: Partial<PlaceSearchFilters>) {
    fetchPlaces({ ...overrides, page: 1 })
  }

  function goToPage(page: number) {
    if (page < 1 || page > (totalPages.value ?? 1)) return
    fetchPlaces({ page })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function resetFilters() {
    filters.value = { page: 1 }
    fetchPlaces()
  }

  return {
    places,
    loading: readonly(loading),
    error: readonly(error),
    total: readonly(total),
    totalPages: readonly(totalPages),
    currentPage: readonly(currentPage),
    filters,
    fetchPlaces,
    applyFilters,
    goToPage,
    resetFilters,
  }
}