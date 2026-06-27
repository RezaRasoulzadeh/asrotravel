import { HotelSearchResponse } from "~/types/hotel.types"

// server/api/hotel/search-page.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  return await safeApiFetch<HotelSearchResponse | null>('/hotel/search-page', { query }, null)
})