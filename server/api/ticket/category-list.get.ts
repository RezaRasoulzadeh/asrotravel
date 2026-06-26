// server/api/ticket/category-list.get.ts
export default defineEventHandler((event) => {
  return proxyRequest(event, 'https://api.asrotravel.com/api/ticket/category-list')
})