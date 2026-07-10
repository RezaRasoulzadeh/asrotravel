// server/api/users/get-wish-list.get.ts
import type { WishListRawResponse } from '~/types/wishlist.types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const service = typeof query.service === 'string' && query.service ? query.service : 'Pool'
  const page = Number(query.page) > 0 ? Number(query.page) : 1

  return await safeAuthApiFetch<WishListRawResponse>(
    event,
    '/users/get-wish-list',
    { query: { service, page } },
    null,
  )
})