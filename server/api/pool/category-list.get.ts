// server/api/pool/category-list.get.ts
export default defineEventHandler((event) => {
  return proxyRequest(event, 'https://api.asrotravel.com/api/pool/category-list')
})