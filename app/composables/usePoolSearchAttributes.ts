// app/composables/usePoolSearchAttributes.ts
import type { PoolSearchPageAttributesResponse } from '~/types/pool.types'

export function usePoolSearchAttributes(location: Ref<string>) {
  const { data, pending, refresh } = useFetch<PoolSearchPageAttributesResponse | null>(
    () => `/api/pool/search-page-attributes?location=${encodeURIComponent(location.value)}`,
    {
      key: () => `pool-search-attributes-${location.value}`,
      default: () => null,
      watch: [location],
    }
  )

  return {
    attributes: computed(() => data.value?.attributes ?? []),
    categories: computed(() => data.value?.categories ?? []),
    minMaxRange: computed(() => data.value?.min_max_range ?? null),
    loading: pending,
    refresh,
  }
}