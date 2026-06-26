// server/api/ticket/search.get.ts
export default defineEventHandler(async (event): Promise<any> => {
  return await safeApiFetch('/ticket/search', {
    query: getQuery(event),
  }, { data: [], total: 0, totalPages: 0, currentPage: 1, perPage: 10 })
})
