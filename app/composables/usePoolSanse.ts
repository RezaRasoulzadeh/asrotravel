// app/composables/usePoolSanse.ts

import type { PoolSanseResponse } from '~/types/poolSingle.types'
import { safeApiFetch } from '~/utils/api'

export function usePoolSanse(poolId: Ref<number | null>) {
  const sanse = ref<PoolSanseResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function refresh() {
    if (!poolId.value) {
      sanse.value = null
      return
    }

    loading.value = true
    error.value = null

    const result = await safeApiFetch<PoolSanseResponse>(
      `/api/pool/${poolId.value}/sanse`,
      {
        method: 'GET',
      },
      'خطا در دریافت سانس‌ها',
    )

    sanse.value = result.data
    error.value = result.error

    loading.value = false
  }

  watch(
    poolId,
    () => {
      refresh()
    },
    { immediate: true },
  )

  return {
    sanse,
    loading: readonly(loading),
    error: readonly(error),
    refresh,
  }
}