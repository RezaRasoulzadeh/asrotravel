// server/api/dashboard/bookings/cancel.post.ts
import type { BookingObjectModel } from '~/types/dashboardBookings.types'

interface CancelBody {
  id?: number
  service?: BookingObjectModel
}

export default defineEventHandler(async (event) => {
  const body = await safeReadBody(event) as CancelBody

  if (!body.id || !body.service) {
    throw createError({ statusCode: 400, statusMessage: 'Missing booking id or service' })
  }

  // body.service is the DTO's objectModel (always capitalized). The backend expects
  // lowercase 'hotel' specifically — resolve through the confirmed casing map rather
  // than forwarding the client value as-is.
  const service = SERVICE_PARAM_BY_MODEL[body.service]

  return safeAuthApiFetch<{ message?: string }>(
    event,
    '/booking/return',
    { method: 'POST', body: { service, booking_id: body.id } },
    { message: undefined },
  )
})