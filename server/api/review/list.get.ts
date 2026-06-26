// server/api/review/list.get.ts

export default defineEventHandler(async (event) => {
  const { apiBase } = useRuntimeConfig()
  const query = getQuery(event)

  return await $fetch(`${apiBase}/review/list`, { query })
})