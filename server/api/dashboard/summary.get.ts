// server/api/dashboard/summary.get.ts
import { ACTIVE_BOOKING_STATUSES } from '~/types/dashboardBookings.types'
import type { BookingTab, DashboardBookingsResponse, DashboardSummary } from '~/types/dashboardBookings.types'

const TABS: BookingTab[] = ['pool', 'hotel', 'ticket']

export default defineEventHandler(async (event): Promise<DashboardSummary> => {
  const fallback: DashboardBookingsResponse = {
    total: 0,
    data: [],
    totalPages: 0,
    currentPage: 1,
    perPage: 10,
  }

  const results = await Promise.all(
    TABS.map(tab =>
      safeAuthApiFetch<DashboardBookingsResponse>(
        event,
        '/booking/list',
        { query: { service: TAB_TO_SERVICE_PARAM[tab], page: 1 } },
        fallback,
      ),
    ),
  )

  // TODO: approximation — only counts page 1 (up to `perPage`) of each tab, since
  // /booking/list has no status filter confirmed to work and no aggregate-count
  // endpoint exists. Fine for the dashboard widget, but not an exact total if any
  // tab has more than one page of active bookings.
  const activeCount = results.reduce((sum, r) => {
    return sum + r.data.filter(b => ACTIVE_BOOKING_STATUSES.includes(b.status as typeof ACTIVE_BOOKING_STATUSES[number])).length
  }, 0)

  const recent = results
    .flatMap(r => r.data)
    .map(mapBookingToDto)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return { activeCount, recent }
})