// app/composables/useConfirmPayment.ts
import type { CheckoutGatewayConfirmResponse } from '~/types/checkout.types'

export function useConfirmPayment() {
  const confirming = ref(true)
  const result = ref<CheckoutGatewayConfirmResponse | null>(null)
  const error = ref<string | null>(null)

  async function confirm(gateway: string, queryParams: Record<string, string>) {
    confirming.value = true
    const serviceType = queryParams.service_type ?? ''

    const { data, error: err } = await safeApiFetch<CheckoutGatewayConfirmResponse>(
      `/api/booking/confirm/${gateway}?service_type=${encodeURIComponent(serviceType)}`,
      { method: 'POST', body: queryParams },
    )

    result.value = data
    error.value = err
    confirming.value = false
  }

  return { confirming, result, error, confirm }
}