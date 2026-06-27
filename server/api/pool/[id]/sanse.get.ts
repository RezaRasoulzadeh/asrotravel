// server/api/pool/[id]/sanse.get.ts
import type { PoolSanseResponse } from '~/types/poolSingle.types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) return null
  return await safeApiFetch<PoolSanseResponse | null>(
    `/pool/get-sanse/${encodeURIComponent(id)}`, {}, null
  )
})