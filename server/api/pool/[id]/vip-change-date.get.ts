// server/api/pool/[id]/vip-change-date.get.ts
import type { VipChangeDateSlot } from '~/types/poolSingle.types'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) return []

  const { start, end } = getQuery(event)

  return await safeApiFetch<VipChangeDateSlot[]>(
    `/pool/vip-chnage-date/${encodeURIComponent(id)}`,
    { query: { start, end } },
    [],
  )
})