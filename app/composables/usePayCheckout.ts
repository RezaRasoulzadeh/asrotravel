// app/composables/usePayCheckout.ts
import type { CheckoutPaymentPayload, CheckoutPaymentResponse } from '~/types/checkout.types'
import { DEFAULT_PAYMENT_GATEWAY } from '~/utils/payment'

export function usePayCheckout() {
  const paying = ref(false)

  async function pay(code: string, payload: CheckoutPaymentPayload): Promise<{ ok: boolean; error?: string }> {
    if (paying.value) return { ok: false }
    paying.value = true

    const body: CheckoutPaymentPayload = {
      ...payload,
      payment_gateway: payload.organization_payment ? undefined : (payload.payment_gateway || DEFAULT_PAYMENT_GATEWAY),
    }

    const result = await usePrivateApiFetch<CheckoutPaymentResponse>(
      `/api/booking/${code}/checkout`,
      { method: 'POST', body },
      'خطا در اتصال به درگاه پرداخت. لطفا دوباره تلاش کنید',
    )
    paying.value = false

    if (result.error || !result.data) return { ok: false, error: result.error ?? undefined }

    if (!import.meta.client) return { ok: true }

    if (result.data.script) {
      const container = document.createElement('div')
      container.innerHTML = result.data.script
      document.body.appendChild(container)
      document.forms[0]?.submit()
      return { ok: true }
    }

    if (result.data.url) {
      window.location.href = result.data.url
      return { ok: true }
    }

    if (result.data.message) useToast().success(result.data.message)

    return { ok: true }
  }

  return { paying, pay }
}