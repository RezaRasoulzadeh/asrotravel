// server/api/dashboard/bookings.get.ts
import type { BookingObjectModel, BookingTab, DashboardBookingsResponse } from '~/types/dashboardBookings.types'

// TODO: filter param name + casing unconfirmed — verify via Network tab.
const TAB_TO_MODEL: Record<BookingTab, BookingObjectModel> = {
  pool: 'Pool',
  hotel: 'Hotel', // unused — Hotel tab is disabled in the UI for now
  ticket: 'Ticket',
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const tab = (typeof query.tab === 'string' && query.tab in TAB_TO_MODEL ? query.tab : 'pool') as BookingTab
  const page = Number(query.page) > 0 ? Number(query.page) : 1

  const fallback: DashboardBookingsResponse = {
    total: 0,
    data: [],
    totalPages: 0,
    currentPage: page,
    perPage: 10,
  }

  return safeAuthApiFetch<DashboardBookingsResponse>(
    event,
    '/booking/list',
    { query: { service: TAB_TO_MODEL[tab], page } },
    fallback,
  )
})