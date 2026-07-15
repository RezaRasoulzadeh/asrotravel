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

  try {
    return await authApiFetch<CheckoutGatewayConfirmResponse>(
      event,
      `/booking/confirm/${gateway}${query}`,
      { method: 'POST', body },
    )
  } catch (error: any) {
    if (error?.statusCode === 401) throw error

    const rawGatewayData = error?.data?.data
    const fallbackMessage = error?.message || 'خطایی در تراکنش رخ داده است. لطفا مجددا تلاش کنید.'

    throw createError({
      statusCode: error?.statusCode ?? 500,
      statusMessage: error?.statusMessage ?? 'Request failed',
      message: resolveGatewayErrorMessage(gateway, rawGatewayData, fallbackMessage),
      data: error?.data,
    })
  }
})