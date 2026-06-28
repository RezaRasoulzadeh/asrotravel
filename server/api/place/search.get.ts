// server/api/place/search.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const params = new URLSearchParams()
  if (query.location) params.set('location', String(query.location))
  if (query.cat) params.set('cat', String(query.cat))
  if (query.sort) params.set('sort', String(query.sort))
  params.set('page', String(query.page ?? 1))

  return await safeApiFetch<any>(
    `/tourismPlaces/get-place-search-data?${params.toString()}`,
    {},
    { data: [], total: 0, totalPages: 1, currentPage: 1 }
  )
})