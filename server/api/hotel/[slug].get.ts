// server/api/hotel/[slug].get.ts
import type { HotelSingleResponse } from '~/types/hotelSingle.types'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) return null

  return await safeOptionalAuthApiFetch<HotelSingleResponse | null>(event, `/hotel/${encodeURIComponent(slug)}/single`, {}, null)
})