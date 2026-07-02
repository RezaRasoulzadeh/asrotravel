// app/composables/useCheckout.ts
import type { CheckoutResponse } from '~/types/checkout.types'

export function useCheckout(code: MaybeRefOrGetter<string>) {
  const { data, error, pending, refresh } = useFetch<CheckoutResponse>(
    () => `/api/booking/${toValue(code)}/checkout`,
    { key: () => `checkout-${toValue(code)}` }
  )

  if (error.value?.statusCode === 401) {
    useAuth().handleSessionExpiry()
  }

  return {
    checkout: data,
    loading: pending,
    error,
    refresh
  }
}