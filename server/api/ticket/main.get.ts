// server/api/ticket/main.get.ts
import type { TicketMainResponse } from '~/composables/useTicketMain'

export default defineEventHandler(async () => {
  return await safeApiFetch<TicketMainResponse | null>(
    '/ticket/main',
    {},
    null
  )
})