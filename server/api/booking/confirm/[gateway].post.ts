// server/api/booking/confirm/[gateway].post.ts
import type { CheckoutGatewayConfirmResponse } from '~/types/checkout.types'

export default defineEventHandler(async (event) => {
  const gateway = getRouterParam(event, 'gateway')
  const body = await readBody<Record<string, unknown>>(event)
  const serviceType = getQuery(event).service_type as string | undefined

  if (!gateway) {
    throw createError({ statusCode: 400, statusMessage: 'Gateway is required' })
  }

  const query = serviceType ? `?service_type=${encodeURIComponent(serviceType)}` : ''

  return await authApiFetch<CheckoutGatewayConfirmResponse>(
    event,
    `/booking/confirm/${gateway}${query}`,
    { method: 'POST', body },
  )
})