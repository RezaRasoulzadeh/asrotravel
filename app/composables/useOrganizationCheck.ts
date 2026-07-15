// app/composables/useOrganizationCheck.ts
import type { CheckoutOrganizationCheck } from '~/types/checkout.types'

export function useOrganizationCheck(code: MaybeRefOrGetter<string>) {
  const checking = ref(true)
  const result = ref<CheckoutOrganizationCheck | null>(null)

  async function check() {
    checking.value = true
    const { data } = await safeApiFetch<CheckoutOrganizationCheck>(
      `/api/booking/${toValue(code)}/organization-check`,
    )
    result.value = data
    checking.value = false
  }

  return { checking, result, check }
}