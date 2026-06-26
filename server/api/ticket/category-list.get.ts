// server/api/ticket/category-list.get.ts
export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase || 'https://api.asrotravel.com'
  
  return await proxyRequest(event, `${baseUrl}/api/pool/top-location-list`)
})