// server/api/dashboard/summary.get.ts
import { ACTIVE_BOOKING_STATUSES } from '~/types/dashboardBookings.types'
import type { BookingTab, DashboardBookingsResponse, DashboardSummary } from '~/types/dashboardBookings.types'
import { WISHLIST_TAB_TO_SERVICE_PARAM, WISHLIST_TABS } from '~/types/wishlist.types'
import type { WishListRawResponse } from '~/types/wishlist.types'

const TABS: BookingTab[] = ['pool', 'hotel', 'ticket']

// TODO
const WISHLIST_ENABLED = false

export default defineEventHandler(async (event): Promise<DashboardSummary> => {
  const fallback: DashboardBookingsResponse = {
    total: 0,
    data: [],
    totalPages: 0,
    currentPage: 1,
    perPage: 10,
  }

  const bookingResultsPromise = Promise.all(
    TABS.map(tab =>
      safeAuthApiFetch<DashboardBookingsResponse>(
        event,
        '/booking/list',
        { query: { service: TAB_TO_SERVICE_PARAM[tab], page: 1 } },
        fallback,
      ),
    ),
  )
  const wishResultsPromise = WISHLIST_ENABLED
    ? Promise.all(
      WISHLIST_TABS.map(tab =>
        safeAuthApiFetch<WishListRawResponse>(
          event,
          '/users/get-wish-list',
          { query: { service: WISHLIST_TAB_TO_SERVICE_PARAM[tab], page: 1 } },
          null,
        ),
      ),
    )
    : Promise.resolve<WishListRawResponse[]>([])

  const bookingResults = await bookingResultsPromise
  const wishResults = await wishResultsPromise

  const activeCount = bookingResults.reduce((sum, r) => {
    return sum + (r.data ?? []).filter(b => ACTIVE_BOOKING_STATUSES.includes(b.status as typeof ACTIVE_BOOKING_STATUSES[number])).length
  }, 0)

  const favoritesCount = wishResults.reduce<number>((sum, r) => sum + extractWishCount(r), 0)

  const recent = bookingResults
    .flatMap(r => r.data ?? [])
    .map(mapBookingToDto)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return { activeCount, favoritesCount, recent }
})