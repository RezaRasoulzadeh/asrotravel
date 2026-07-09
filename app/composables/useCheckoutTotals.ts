// app/composables/useCheckoutTotals.ts
import type { CheckoutResponse, CheckoutService } from '~/types/checkout.types'

function isServiceObject(service: CheckoutResponse['service']): service is CheckoutService {
  return !!service && typeof service === 'object'
}

export function useCheckoutTotals(checkout: MaybeRefOrGetter<CheckoutResponse>) {
  const totalBeforeDiscount = computed(() => {
    const c = toValue(checkout)
    return isServiceObject(c.service)
      ? Number(c.service.total_price || 0)
      : Number(c.booking.total_before_discount || c.booking.total || 0)
  })
  const offerAmount = computed(() => {
    const c = toValue(checkout)
    return isServiceObject(c.service) ? Number(c.service.total_offer || 0) : 0
  })
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