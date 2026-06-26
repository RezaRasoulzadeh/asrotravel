// server/api/hotel/search-page.get.ts
export default defineEventHandler(async (event): Promise<any> => {
  return await safeApiFetch('/hotel/search-page', {
    query: getQuery(event),
  }, { data: [], total: 0, totalPages: 0, currentPage: 1, perPage: 10 })
})
