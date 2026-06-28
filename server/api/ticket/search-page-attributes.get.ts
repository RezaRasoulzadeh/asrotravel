// server/api/ticket/search-page-attributes.get.ts
import type { TicketSearchPageAttributes } from '~/types/ticket.types'

const FALLBACK = {
  categories: [],
  min_max_range: { min_price: 0, max_price: 40000000 },
} as unknown as TicketSearchPageAttributes

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const location = typeof query.location === 'string' ? query.location : ''

  return await safeApiFetch<TicketSearchPageAttributes>(
    `/ticket/search-page-attributes?location=${encodeURIComponent(location)}`,
    {},
    FALLBACK
  )
})