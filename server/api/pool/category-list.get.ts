// server/api/pool/category-list.get.ts
export default defineEventHandler(async (event): Promise<any> => {
  return await safeApiFetch('/pool/category-list', {
    query: getQuery(event),
  }, [])
})
