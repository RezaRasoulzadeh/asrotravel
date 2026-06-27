import { HotelSearchPageAttributes } from "~/types/hotel.types"

// server/api/hotel/search-page-attributes.get.ts
export default defineEventHandler(async () => {
  return await safeApiFetch<HotelSearchPageAttributes | null>('/hotel/search-page-attributes', {}, null)
})