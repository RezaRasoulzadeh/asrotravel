// server/api/blog/[slug].get.ts

export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig()
  const slug = getRouterParam(event, 'slug')

  return await $fetch(`${apiBase}/blog/${encodeURIComponent(slug ?? '')}`)
})