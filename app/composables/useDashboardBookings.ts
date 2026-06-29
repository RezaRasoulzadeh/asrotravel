// app/composables/useDashboardBookings.ts
import type { BookingTab, DashboardBooking, DashboardBookingsResponse } from '~/types/dashboardBookings.types'

const CANCELLABLE_STATUSES = ['paid', 'confirmed', 'partial_payment']

export function isBookingCancellable(status: string): boolean {
  return CANCELLABLE_STATUSES.includes(status)
}

export function useDashboardBookings(initialTab: BookingTab = 'pool') {
  const tab = ref<BookingTab>(initialTab)
  const items = ref<DashboardBooking[]>([])
  const currentPage = ref(1)
  const totalPages = ref(1)
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const auth = useAuth()

  async function fetchPage(page: number) {
    loading.value = true

    const result = await safeApiFetch<DashboardBookingsResponse>('/api/dashboard/bookings', {
      query: { tab: tab.value, page },
    })

    loading.value = false

    if (result.status === 401) {
      await auth.handleSessionExpiry()
      return
    }

    if (result.error || !result.data) {
      error.value = result.error ?? 'خطا در دریافت رزروها'
      return
    }

    error.value = null
    currentPage.value = result.data.currentPage
    totalPages.value = result.data.totalPages
    items.value = page === 1 ? result.data.data : items.value.concat(result.data.data)
  }

  async function loadMore() {
    if (loading.value || currentPage.value >= totalPages.value) return
    await fetchPage(currentPage.value + 1)
  }

  async function switchTab(next: BookingTab) {
    if (tab.value === next) return
    tab.value = next
    items.value = []
    currentPage.value = 1
    totalPages.value = 1
    await fetchPage(1)
  }

  async function cancelBooking(id: number) {
    const result = await usePrivateApiFetch<{ message?: string }>(
      `/api/dashboard/bookings/${id}/cancel`,
      { method: 'POST' },
      'خطا در لغو رزرو',
    )

    if (result.error) return false

    items.value = items.value.map(item =>
      item.id === id ? { ...item, status: 'cancelled', status_text: 'cancelled' } : item,
    )
    return true
  }

  const hasMore = computed(() => currentPage.value < totalPages.value)
  const isEmpty = computed(() => !loading.value && !error.value && items.value.length === 0)

  return { tab, items, loading, error, hasMore, isEmpty, fetchPage, loadMore, switchTab, cancelBooking }
}