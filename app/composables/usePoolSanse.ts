// app/composables/usePoolSanse.ts
import type { PoolSanseResponse } from '~/types/poolSingle.types'

export function usePoolSanse(poolId: Ref<number | null>) {
  const { data, pending, error, execute } = useFetch<PoolSanseResponse | null>(
    () => `/api/pool/${poolId.value}/sanse`,
    {
      key: () => `pool-sanse-${poolId.value ?? 'none'}`,
      default: () => null,
      immediate: false,
    }
  )

  watch(poolId, (id) => {
    if (id) execute()
  }, { immediate: true })

  return {
    sanse: data,
    loading: pending,
    error,
    refresh: execute,
  }
}