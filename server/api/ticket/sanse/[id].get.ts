// server/api/ticket/sanse/[id].get.ts

import type { TicketSanse } from '~/types/ticketSingle.types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id)
    return null

  return await safeApiFetch<TicketSanse | null>(
    `/ticket/get-sanse/${encodeURIComponent(id)}`,
    {},
    null,
  )
})