// app/composables/usePoolMain.ts
import type { PoolMainResponse } from '~/types/pool.types'

export function usePoolMain() {
  const { data, pending, error, refresh } = useFetch<PoolMainResponse | null>(
    '/api/pool/main',
    { key: 'pool-main', default: () => null }
  )

  return {
    promotions: computed(() => data.value?.promotions ?? []),
    settingData: computed(() => data.value?.setting_data ?? null),
    seo: computed(() => data.value?.seo ?? null),
    faqs: computed(() => data.value?.faqs ?? []),
    loading: pending,
    error,
    refresh,
  }
}