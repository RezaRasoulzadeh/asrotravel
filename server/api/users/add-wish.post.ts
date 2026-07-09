// server/api/users/add-wish.post.ts
import type { AddWishPayload, AddWishResponse } from '~/types/wishNotification.types'

export default defineEventHandler(async (event) => {
  const body = await readBody<AddWishPayload>(event)

  return await authApiFetch<AddWishResponse>(
    event,
    '/users/add-wish',
    { method: 'POST', body },
  )
})