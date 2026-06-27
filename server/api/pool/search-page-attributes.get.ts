// server/api/pool/search-page-attributes.get.ts
import type { PoolSearchPageAttributesResponse } from '~/types/pool.types'

export default defineEventHandler(async (event) => {
  const locationParam = getQuery(event).location
  const location = typeof locationParam === 'string' ? locationParam : ''

  return await safeApiFetch<PoolSearchPageAttributesResponse | null>(
    `/pool/search-page-attributes?location=${encodeURIComponent(location)}`,
    {},
    null
  )
})