// server/api/tickets/group-ticket.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rel = query.rel || 'popular'
  const config = useRuntimeConfig()
  const apiBase = config.apiBase || 'https://api.asrotravel.com/api'

  return await $fetch(`${apiBase}/ticket/group-ticket`, {
    query: { rel }
  })
})