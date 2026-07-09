// server/api/ticket/[slug]/single.get.ts

import type { TicketSingleApiResponse } from '~/types/ticketSingle.types'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')

  if (!slug) return null

  const encodedSlug = encodeURIComponent(slug)

  return await safeOptionalAuthApiFetch<TicketSingleApiResponse | null>(
    event,
    `/ticket/${encodedSlug}/single`,
    {},
    null,
  )
})