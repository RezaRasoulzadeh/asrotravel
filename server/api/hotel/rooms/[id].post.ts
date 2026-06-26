// server/api/hotel/rooms/[id].post.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) return []

  const query = getQuery(event)
  const body = await safeReadBody(event)
  const params = { ...query, ...body }

  return await safeApiFetch(`/hotel/get-rooms/${encodeURIComponent(id)}`, {
    method: 'POST',
    query: params,
  }, [])
})
