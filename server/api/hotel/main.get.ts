// server/api/hotel/main.get.ts
import type { HotelMainResponse } from '~/types/hotel.types'

export default defineEventHandler(async (event) => {
  return await safeApiFetch<HotelMainResponse | null>('/hotel/main', {}, null)
})
