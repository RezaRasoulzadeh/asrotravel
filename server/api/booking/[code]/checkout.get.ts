// server/api/booking/[code]/checkout.get.ts
import type { CheckoutResponse } from '~/types/checkout.types'

export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Booking code is required' })
  }

  const result = await safeAuthApiFetch<CheckoutResponse | null>(
    event,
    `/booking/${code}/checkout`,
    {},
    null,
  )

  if (!result) {
    throw createError({ statusCode: 502, statusMessage: 'Failed to load checkout' })
  }

  return result
})