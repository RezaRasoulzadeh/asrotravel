// server/api/blog/[slug].get.ts

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) return null

  return await safeApiFetch(`/blog/${encodeURIComponent(slug)}`, {}, null)
})
