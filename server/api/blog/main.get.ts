// server/api/blog/main.get.ts

export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig()
  const query = getQuery(event)

  return await $fetch(`${apiBase}/blog/main`, { query })
})