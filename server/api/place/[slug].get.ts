// server/api/place/[slug].get.ts
export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) return null
  return await safeApiFetch<any>(
    `/tourismPlaces/getPlace/${encodeURIComponent(slug)}`,
    {},
    null
  )
})