// server/api/booking/[code]/organization-check.get.ts
import type { CheckoutOrganizationCheck } from '~/types/checkout.types'

// TODO: confirm exact backend path with team — inferred from /booking/{code}/checkout convention
export default defineEventHandler(async (event) => {
  const code = getRouterParam(event, 'code')

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Booking code is required' })
  }

  return await safeAuthApiFetch<CheckoutOrganizationCheck>(
    event,
    `/booking/${code}/organization-check`,
    {},
    { access_to_organization: false },
  )
})