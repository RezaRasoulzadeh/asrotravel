// server/api/ticket/sanse/[id].get.ts

import type { TicketSanse } from '~/types/ticketSingle.types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) return null

  const encodedId = encodeURIComponent(id)

  return await safeApiFetch<TicketSanse | null>(
    `/ticket/get-sanse/${encodedId}`,
    {},
    null,
  )
})