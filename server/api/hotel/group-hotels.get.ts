// ~/server/api/hotel/group-hotels.get.ts
export default defineEventHandler(async (event): Promise<any> => {
  const query = getQuery(event)
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase || 'https://api.asrotravel.com'
  
  return await $fetch(`${baseUrl}/api/hotel/group-hotels`, {
    query: { rel: query.rel || 'popular' }
  })
})