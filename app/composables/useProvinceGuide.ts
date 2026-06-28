// composables/useProvinceGuide.ts
import type { ProvincePageData } from '~/types/province.types'

export function useProvinceGuide(slug: string | Ref<string>) {
  const { data, pending, error, refresh } = useFetch<ProvincePageData | null>(
    () => `/api/place/travel-guide/${encodeURIComponent(toValue(slug))}`,
    { key: () => `province-guide-${toValue(slug)}`, default: () => null }
  )

  return {
    data,
    loading: pending,
    error,
    refresh,
  }
}