// server/api/blog/main.get.ts

export default defineEventHandler(async (event) => {
  const query = getQuery(event)

  return await safeApiFetch('/blog/main', { query }, { data: [], totalPages: 1 })
})
