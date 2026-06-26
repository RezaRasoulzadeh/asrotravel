// server/api/pool/search.get.ts
export default defineEventHandler((event) => {
  return proxyRequest(event, 'https://api.asrotravel.com/api/pool/search')
})