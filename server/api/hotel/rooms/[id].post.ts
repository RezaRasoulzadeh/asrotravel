// server/api/hotel/rooms/[id].post.ts
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing hotel id' })
  }

  const query = getQuery(event)
  const body = await readBody(event).catch(() => ({}))
  const params = { ...query, ...(body && typeof body === 'object' ? body : {}) }
  const { apiBase } = useRuntimeConfig()

  return await $fetch(`${apiBase}/hotel/get-rooms/${encodeURIComponent(id)}`, {
    method: 'POST',
    query: params,
    headers: {
      'Accept': 'application/json',
    },
  })
})
