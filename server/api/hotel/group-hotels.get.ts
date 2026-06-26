// ~/server/api/hotel/group-hotels.get.ts
export default defineEventHandler(async (event): Promise<any> => {
  const query = getQuery(event)
  
  return await safeApiFetch('/hotel/group-hotels', {
    query: { rel: query.rel || 'popular' }
  }, [])
})
