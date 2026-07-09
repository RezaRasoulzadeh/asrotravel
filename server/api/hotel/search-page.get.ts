// server/api/hotel/search-page.get.ts
import { HotelSearchResponse } from "~/types/hotel.types"
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  return await safeOptionalAuthApiFetch<HotelSearchResponse | null>(event, '/hotel/search-page', { query }, null)
})