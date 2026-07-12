// server/api/support/[id].get.ts
import type { SupportTicketShowRaw } from '~/types/support.types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Ticket id is required' })
  }

  const raw = await safeAuthApiFetch<SupportTicketShowRaw>(
    event,
    `/support/show/${encodeURIComponent(id)}`,
    {},
    [],
  )

  return mapSupportTicketShowToDto(raw)
})
