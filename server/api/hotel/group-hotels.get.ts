// ~/server/api/hotel/group-hotels.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rel = query.rel || 'popular'
  
  return await $fetch(`https://api.asrotravel.com/api/hotel/group-hotels?rel=${rel}`)
})