// server/api/hotel/main.get.ts
import type { HotelMainResponse } from '~/types/hotel.types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  try {
    return await $fetch<HotelMainResponse>(`${config.apiBase}/hotel/main`)
  } catch (err: any) {
    throw createError({
      statusCode: err?.response?.status || 500,
      statusMessage: 'Failed to fetch hotel main data',
    })
  }
})