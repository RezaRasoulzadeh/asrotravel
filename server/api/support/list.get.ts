// server/api/support/list.get.ts
import type { SupportSort, SupportTicketListDtoResponse, SupportTicketListResponse } from '~/types/support.types'

const VALID_SORTS: SupportSort[] = ['all', 'opening', 'closed']

const BACKEND_SORT_PARAM: Record<SupportSort, SupportSort> = {
  all: 'all',
  opening: 'closed',
  closed: 'opening',
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const sort = (typeof query.sort === 'string' && VALID_SORTS.includes(query.sort as SupportSort)
    ? query.sort
    : 'all') as SupportSort
  const page = Number(query.page) > 0 ? Number(query.page) : 1

  const fallback: SupportTicketListResponse = {
    data: [],
    total: 0,
    totalPages: 0,
    currentPage: page,
    perPage: 10,
  }

  const raw = await safeAuthApiFetch<SupportTicketListResponse>(
    event,
    '/support/list',
    { query: { sort: BACKEND_SORT_PARAM[sort], page } },
    fallback,
  )

  const dto: SupportTicketListDtoResponse = {
    total: raw.total ?? raw.data.length,
    totalPages: raw.totalPages ?? 1,
    currentPage: raw.currentPage ?? page,
    perPage: raw.perPage ?? 10,
    data: raw.data.map(mapSupportTicketToDto),
  }

  return dto
})