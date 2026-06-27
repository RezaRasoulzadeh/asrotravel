// app/composables/usePoolSingle.ts
import type { PoolSingleResponse } from '~/types/poolSingle.types'

export function usePoolSingle(slug: string | Ref<string>) {
  const { data, pending, error, refresh } = useFetch<PoolSingleResponse | null>(
    () => `/api/pool/${encodeURIComponent(toValue(slug))}`,
    { key: () => `pool-single-${toValue(slug)}`, default: () => null }
  )

  return {
    pool: computed(() => data.value?.pool ?? null),
    gallery: computed(() => data.value?.gallery ?? []),
    related: computed(() => data.value?.related ?? []),
    seo: computed(() => data.value?.seo ?? null),
    loading: pending,
    error,
    refresh,
  }
}