// server/api/ticket/category-list.get.ts
export default defineEventHandler(async (event): Promise<any> => {
  return await safeApiFetch('/ticket/category-list', {
    query: getQuery(event),
  }, [])
})
