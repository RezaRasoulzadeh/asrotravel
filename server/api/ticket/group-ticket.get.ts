// server/api/tickets/group-ticket.get.ts
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const rel = query.rel || 'popular'

  return await safeApiFetch('/ticket/group-ticket', {
    query: { rel }
  }, [])
})
