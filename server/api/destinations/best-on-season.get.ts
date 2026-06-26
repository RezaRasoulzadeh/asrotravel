// server/api/destinations/best-on-season.get.ts
export default defineEventHandler(async (event) => {
  return await safeApiFetch('/location/best-on-season', {}, [])
})
