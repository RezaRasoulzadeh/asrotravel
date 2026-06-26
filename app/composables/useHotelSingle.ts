// composables/useHotelSingle.ts
import type { HotelSingleResponse } from '~/types/hotelSingle.types'

export function useHotelSingle(slug: string | Ref<string>) {
  const { data, pending, error, refresh } = useFetch<HotelSingleResponse>(
    () => `/api/hotel/${encodeURIComponent(toValue(slug))}`,
    {
      key: () => `hotel-single-${toValue(slug)}`,
    }
  )

  return {
    hotel: computed(() => data.value?.hotel ?? null),
    gallery: computed(() => data.value?.gallery ?? []),
    similar: computed(() => data.value?.related ?? []),
    seo: computed(() => data.value?.hotel?.seo ?? null),
    faqs: computed(() => data.value?.hotel?.faqs ?? []),
    loading: pending,
    error,
    refresh,
  }
}