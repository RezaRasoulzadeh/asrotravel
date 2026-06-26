// server/api/pool/top-location-list.get.ts
export default defineEventHandler(async (event): Promise<any> => {
  return await safeApiFetch('/pool/top-location-list', {
    query: getQuery(event),
  }, [])
})
