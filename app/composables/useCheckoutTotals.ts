// app/composables/useCheckoutTotals.ts
import type { CheckoutResponse } from '~/types/checkout.types'

export function useCheckoutTotals(checkout: MaybeRefOrGetter<CheckoutResponse>) {
  const totalBeforeDiscount = computed(() => Number(toValue(checkout).service.total_price || 0))
  const offerAmount = computed(() => Number(toValue(checkout).service.total_offer || 0))
  const couponAmount = computed(() => Number(toValue(checkout).booking.coupon_amount || 0))
  const hasCoupon = computed(() => couponAmount.value > 0)
  const discountAmount = computed(() => hasCoupon.value ? couponAmount.value : offerAmount.value)
  const finalTotal = computed(() => totalBeforeDiscount.value - discountAmount.value)
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