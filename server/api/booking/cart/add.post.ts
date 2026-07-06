// server/api/booking/cart/add.post.ts
import type { CartAddPayload, VipCartAddPayload, HotelCartAddPayload, CartAddResponse } from '~/types/cart.types'

export default defineEventHandler(async (event) => {
  const body = await readBody<CartAddPayload | VipCartAddPayload | HotelCartAddPayload>(event)

  const result = await authApiFetch<CartAddResponse>(
    event,
    '/booking/cart/add',
    { method: 'POST', body },
  )

  if (!result?.booking_code) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Failed to create booking',
      data: result,
    })
  }

  return result
})