// server/api/booking/cart/add.post.ts
import type { CartAddPayload, VipCartAddPayload, HotelCartAddPayload, CartRefreshPayload, CartAddResponse } from '~/types/cart.types'

export default defineEventHandler(async (event) => {
  const body = await readBody<CartAddPayload | VipCartAddPayload | HotelCartAddPayload | CartRefreshPayload>(event)

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