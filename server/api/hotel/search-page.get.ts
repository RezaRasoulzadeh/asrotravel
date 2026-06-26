// server/api/hotel/search-page.get.ts
export default defineEventHandler(async (event): Promise<any> => {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiBase || 'https://api.asrotravel.com'
  
  return await proxyRequest(event, `${baseUrl}/api/hotel/search-page`)
})