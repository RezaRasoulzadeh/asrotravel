// server/api/dashboard/bookings.get.ts
import type { BookingStatus, BookingTab, DashboardBookingsDtoResponse, DashboardBookingsResponse } from '~/types/dashboardBookings.types'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tab = (typeof query.tab === 'string' && query.tab in TAB_TO_MODEL ? query.tab : 'pool') as BookingTab
  const page = Number(query.page) > 0 ? Number(query.page) : 1
  const status = typeof query.status === 'string' && query.status ? (query.status as BookingStatus) : undefined

  const fallback: DashboardBookingsResponse = {
    total: 0,
    data: [],
    totalPages: 0,
    currentPage: page,
    perPage: 10,
  }

  const raw = await safeAuthApiFetch<DashboardBookingsResponse>(
    event,
    '/booking/list',
    {
      query: {
        service: TAB_TO_SERVICE_PARAM[tab],
        page,
        ...(status ? { status } : {}), 
      },
    },
    fallback,
  )

  const dto: DashboardBookingsDtoResponse = {
    total: raw.total,
    totalPages: raw.totalPages,
    currentPage: raw.currentPage,
    perPage: raw.perPage,
    data: (raw.data ?? []).map(mapBookingToDto),
  }

  return dto
})