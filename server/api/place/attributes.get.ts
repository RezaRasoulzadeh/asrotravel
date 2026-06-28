// server/api/place/attributes.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const params = new URLSearchParams()
  if (query.cat) params.set('cat', String(query.cat))

  return await safeApiFetch<any>(
    `/tourismPlaces/get-place-search-attributes?${params.toString()}`,
    {},
    { categories: [] }
  )
})