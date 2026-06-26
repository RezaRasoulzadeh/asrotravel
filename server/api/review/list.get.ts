// server/api/review/list.get.ts

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await safeApiFetch('/review/list', { query }, { data: [], total: 0, totalPages: 0 })
})
