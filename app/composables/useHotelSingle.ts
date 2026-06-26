// composables/useHotelSingle.ts
import type { HotelSingleResponse } from '~/types/hotelSingle.types'

export function useHotelSingle(slug: string | Ref<string>) {
  const { data, pending, error, refresh } = useFetch<HotelSingleResponse>(
    () => `/api/hotel/${encodeURIComponent(toValue(slug))}`,
    {
      key: () => `hotel-single-${toValue(slug)}`,
    }
  )

  const hotel = computed(() => data.value?.hotel ?? null)
  const gallery = computed(() => data.value?.gallery ?? [])
  const related = computed(() => data.value?.related ?? [])
  const seo = computed(() => hotel.value?.seo ?? null)
  const faqs = computed(() => hotel.value?.faqs ?? [])

  return {
    hotel,
    gallery,
    related,
    seo,
    faqs,
    loading: pending,
    error,
    refresh,
  }
}