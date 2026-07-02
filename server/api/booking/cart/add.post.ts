// server/api/booking/cart/add.post.ts
import type { CartAddPayload, CartAddResponse } from '~/types/cart.types'

export default defineEventHandler(async (event) => {
  const body = await readBody<CartAddPayload>(event)

  const result = await safeAuthApiFetch<CartAddResponse | null>(
    event,
    '/booking/cart/add',
    { method: 'POST', body },
    null,
  )

  if (!result?.booking_code) {
    throw createError({ statusCode: 502, statusMessage: 'Failed to create booking' })
  }

  return result
})