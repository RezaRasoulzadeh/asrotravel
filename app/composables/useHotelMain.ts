// composables/useHotelMain.ts
import type { HotelMainResponse } from '~/types/hotel.types'

export function useHotelMain() {
  const { data, pending, error, refresh } = useFetch<HotelMainResponse>('/api/hotel/main', {
    key: 'hotel-main',
    lazy: true,
  })

  const promotions = computed(() => data.value?.promotions ?? [])
  const settingData = computed(() => data.value?.setting_data ?? null)
  const seo = computed(() => data.value?.seo ?? null)
  const faqs = computed(() => data.value?.faqs ?? [])

  return {
    promotions,
    settingData,
    seo,
    faqs,
    loading: pending,
    error,
    refresh,
  }
}