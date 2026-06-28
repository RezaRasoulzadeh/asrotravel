// server/api/place/travel-guide/[slug].get.ts
import type { ProvincePageData } from '~/types/province.types'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) return null
  return await safeApiFetch<ProvincePageData | null>(
    `/tourismPlaces/get-province-main/${encodeURIComponent(slug)}`,
    {},
    null
  )
})