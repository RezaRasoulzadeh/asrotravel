// app/composables/useTicketSanse.ts

import type { Ref } from 'vue'
import type { TicketSanse } from '~/types/ticketSingle.types'
import { safeApiFetch } from '~/utils/api'

export function useTicketSanse(ticketId: Ref<number |null>) {
  const sanse = ref<TicketSanse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSanse() {
    const id = toValue(ticketId)

    if (!id) {
      sanse.value = null
      return
    }

    loading.value = true

    const { data, error: fetchError } = await safeApiFetch<TicketSanse>(
      `/api/ticket/sanse/${encodeURIComponent(String(id))}`,
    )

    sanse.value = data
    error.value = fetchError
    loading.value = false
  }

  watch(
    () => toValue(ticketId),
    fetchSanse,
    { immediate: true },
  )

  return {
    sanse,
    loading: readonly(loading),
    error: readonly(error),
    refresh: fetchSanse,
  }
}