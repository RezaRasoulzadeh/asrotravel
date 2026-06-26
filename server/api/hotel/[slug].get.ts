// server/api/hotel/[slug].get.ts
import type { HotelSingleResponse } from '~/types/hotelSingle.types'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing slug' })
  }

  const config = useRuntimeConfig()

  try {
    return await $fetch<HotelSingleResponse>(
      `${config.apiBase}/hotel/${encodeURIComponent(slug)}/single`,
    )
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.status || 404,
      statusMessage: 'Hotel not found',
    })
  }
})