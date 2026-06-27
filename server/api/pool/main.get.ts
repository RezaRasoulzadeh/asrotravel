// server/api/pool/main.get.ts
import type { PoolMainResponse } from '~/types/pool.types'

export default defineEventHandler(async () => {
  return await safeApiFetch<PoolMainResponse | null>('/pool/main', {}, null)
})