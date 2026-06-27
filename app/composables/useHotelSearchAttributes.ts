// app/composables/useHotelSearchAttributes.ts
import type { HotelSearchPageAttributes, HotelLocation, HotelAttributeTerm, HotelAttribute } from '~/types/hotel.types'
import type { SafeApiResult } from '~/utils/api'

let _cache: HotelSearchPageAttributes | null = null
let _fetchPromise: Promise<SafeApiResult<HotelSearchPageAttributes | null>> | null = null

export function useHotelSearchAttributes() {
  const locations = ref<HotelLocation[]>([])
  const attributes = ref<HotelAttribute[]>([])
  const propertyTypes = ref<HotelAttributeTerm[]>([])
  const facilities = ref<HotelAttributeTerm[]>([])
  const services = ref<HotelAttributeTerm[]>([])
  const priceRange = ref<{ min: number; max: number }>({ min: 0, max: 40_000_000 })
  const loading = ref(false)
  const error = ref<string | null>(null)

  function applyData(data: HotelSearchPageAttributes) {
    locations.value = data?.location_list ?? []
    attributes.value = data?.attributes ?? []
    priceRange.value = {
      min: Math.round(Number(data?.min_max_range?.min_price ?? 0) / 10),
      max: Math.round(Number(data?.min_max_range?.max_price ?? 40_000_000) / 10),
    }

    const attrMap = Object.fromEntries((data?.attributes ?? []).map(a => [a?.id, a]))
    propertyTypes.value = attrMap[5]?.terms ?? []
    facilities.value = attrMap[6]?.terms ?? []
    services.value = attrMap[7]?.terms ?? []
  }

  async function fetchAttributes() {
    if (_cache != null) {
      applyData(_cache)
      return
    }

    if (_fetchPromise != null) {
      loading.value = true
      const res = await _fetchPromise
      if (res?.data != null) applyData(res.data)
      if (res?.error != null) error.value = res.error
      loading.value = false
      return
    }

    loading.value = true
    error.value = null

    _fetchPromise = safeApiFetch<HotelSearchPageAttributes | null>('/api/hotel/search-page-attributes')
    
    const res = await _fetchPromise
    if (res?.data != null) {
      _cache = res.data
      applyData(res.data)
    } else if (res?.error != null) {
      error.value = res.error
    }

    _fetchPromise = null
    loading.value = false
  }

  fetchAttributes()

  return {
    locations: readonly(locations),
    attributes: readonly(attributes),
    propertyTypes: readonly(propertyTypes),
    facilities: readonly(facilities),
    services: readonly(services),
    priceRange: readonly(priceRange),
    loading: readonly(loading),
    error: readonly(error),
    fetchAttributes,
  }
}