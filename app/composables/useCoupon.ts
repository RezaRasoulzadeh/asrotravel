// app/composables/useCoupon.ts
import type { CouponApplyResponse } from '~/types/checkout.types'

export function useCoupon() {
  const applying = ref(false)

  async function applyCoupon(bookingCode: string, couponCode: string) {
    applying.value = true

    try {
      const result = await usePrivateApiFetch<CouponApplyResponse>(
        `/api/booking/${bookingCode}/coupon`,
        { method: 'POST', body: { coupon_code: couponCode } },
        'خطا در اعمال کد تخفیف',
      )

      return result
    } finally {
      applying.value = false
    }
  }

  return { applying, applyCoupon }
}