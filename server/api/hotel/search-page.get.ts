// server/api/hotel/search-page.get.ts
export default defineEventHandler((event) => {
  return proxyRequest(event, 'https://api.asrotravel.com/api/hotel/search-page')
})