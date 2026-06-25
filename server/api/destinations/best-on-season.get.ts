// server/api/destinations/best-on-season.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const apiBase = config.apiBase || 'https://api.asrotravel.com/api'
  
  return await $fetch(`${apiBase}/location/best-on-season`)
})