// server/api/pool/group-pools.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rel = query.rel || 'popular'
  
  return await safeApiFetch('/pool/group-pools', {
    query: { rel }
  }, [])
})
