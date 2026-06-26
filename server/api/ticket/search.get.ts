// server/api/ticket/search.get.ts
export default defineEventHandler((event) => {
  return proxyRequest(event, 'https://api.asrotravel.com/api/ticket/search')
})