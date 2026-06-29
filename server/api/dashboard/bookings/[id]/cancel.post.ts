// server/api/dashboard/bookings/[id]/cancel.post.ts
// TODO: real path/payload unconfirmed — guessed from legacy
// `$api.cart.cancelBooking({ service, booking_id })`. Fix once verified.

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing booking id' })
  }

  return safeAuthApiFetch<{ message?: string }>(
    event,
    `/booking/${id}/cancel`,
    { method: 'POST' },
    { message: undefined },
  )
})