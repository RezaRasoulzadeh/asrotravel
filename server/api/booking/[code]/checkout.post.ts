// server/api/booking/[code]/checkout.post.ts
import type { CheckoutPaymentPayload, CheckoutPaymentResponse } from '~/types/checkout.types'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')
  const body = await readBody<CheckoutPaymentPayload>(event) ?? {} as CheckoutPaymentPayload

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Booking code is required' })
  }

  return await authApiFetch<CheckoutPaymentResponse>(
    event,
    '/booking/do-checkout',
    { method: 'POST', body: { ...body, code, mobile: body.mobile ?? '' } },
  )
})