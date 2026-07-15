// app/composables/useCheckoutTotals.ts
import type { CheckoutResponse } from '~/types/checkout.types'

export function useCheckoutTotals(checkout: MaybeRefOrGetter<CheckoutResponse>) {
  const totalBeforeDiscount = computed(() => {
    const c = toValue(checkout)
    return Number(c.booking.total_before_discount || c.booking.total || 0)
  })
  const finalTotal = computed(() => Number(toValue(checkout).booking.total || 0))
  const discountAmount = computed(() => totalBeforeDiscount.value - finalTotal.value)
  const offerAmount = computed(() => discountAmount.value)
  const couponAmount = computed(() => Number(toValue(checkout).booking.coupon_amount || 0))
  const hasCoupon = computed(() => couponAmount.value > 0)
  const deposit = computed(() => Number(toValue(checkout).booking.deposit || 0))
  const hasDeposit = computed(() => deposit.value > 0 && deposit.value < finalTotal.value)
  const payableTotal = computed(() => hasDeposit.value ? deposit.value : finalTotal.value)
  const remainingAtVenue = computed(() => finalTotal.value - deposit.value)

  return {
    totalBeforeDiscount,
    offerAmount,
    couponAmount,
    hasCoupon,
    discountAmount,
    finalTotal,
    deposit,
    hasDeposit,
    payableTotal,
    remainingAtVenue,
  }
}