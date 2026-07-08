// server/api/booking/[code]/coupon.post.ts
import type { CouponApplyResponse } from '~/types/checkout.types'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')
  const body = await readBody<{ coupon_code?: string }>(event)
  const couponCode = body?.coupon_code?.trim()

  if (!code || !couponCode) {
    throw createError({ statusCode: 400, statusMessage: 'کد رزرو و کد تخفیف الزامی است' })
  }
  return await authApiFetch<CouponApplyResponse>(
    event,
    `/coupon/${code}/check?coupon_code=${encodeURIComponent(couponCode)}`,
    { method: 'GET' },
  )
})