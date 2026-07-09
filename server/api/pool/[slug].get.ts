// server/api/pool/[slug].get.ts
import type { PoolSingleResponse } from '~/types/poolSingle.types'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) return null
  return await safeOptionalAuthApiFetch<PoolSingleResponse | null>(
    event, `/pool/${encodeURIComponent(slug)}/single`, {}, null
  )
})