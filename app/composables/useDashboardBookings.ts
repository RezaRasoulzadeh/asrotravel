// app/composables/useDashboardBookings.ts
import type { BookingSortOption, BookingStatus, BookingTab, DashboardBookingDto, DashboardBookingsDtoResponse } from '~/types/dashboardBookings.types'
import { BOOKING_STATUS_LABELS } from '~/types/dashboardBookings.types'

function normalize(str: string | null | undefined): string {
  return (str ?? '').toLowerCase().trim()
}

function matchesSearch(item: DashboardBookingDto, rawQuery: string): boolean {
  const q = normalize(rawQuery)
  if (!q) return true

  const haystacks = [item.code, item.title, item.locationName, item.reservationCode]
  return haystacks.some(h => normalize(h).includes(q))
}

function sortItems(items: DashboardBookingDto[], sort: BookingSortOption): DashboardBookingDto[] {
  const arr = [...items]
  switch (sort) {
    case 'oldest':
      return arr.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    case 'price_high':
      return arr.sort((a, b) => Number.parseFloat(b.totalDisplay) - Number.parseFloat(a.totalDisplay))
    case 'price_low':
      return arr.sort((a, b) => Number.parseFloat(a.totalDisplay) - Number.parseFloat(b.totalDisplay))
    case 'newest':
    default:
      return arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }
}

export function useDashboardBookings(initialTab: BookingTab = 'pool') {
  const tab = ref<BookingTab>(initialTab)
  const status = ref<BookingStatus | null>(null)
  const sort = ref<BookingSortOption>('newest')
  const search = ref('')

  const rawItems = ref<DashboardBookingDto[]>([])
  const currentPage = ref(0)
  const totalPages = ref(1)
  const total = ref(0)
  const allLoaded = computed(() => currentPage.value > 0 && currentPage.value >= totalPages.value)

  const loading = ref(true)
  const loadingAll = ref(false)
  const error = ref<string | null>(null)

  const auth = useAuth()
  let generation = 0

  const needsFullData = computed(() => !!search.value.trim() || sort.value !== 'newest')

  async function fetchOnePage(page: number, gen: number): Promise<boolean> {
    const result = await safeApiFetch<DashboardBookingsDtoResponse>('/api/dashboard/bookings', {
      query: { tab: tab.value, page, ...(status.value ? { status: status.value } : {}) },
    })

    if (gen !== generation) return false

    if (result.status === 401) {
      await auth.handleSessionExpiry()
      return false
    }

    if (result.error || !result.data) {
      error.value = result.error ?? 'خطا در دریافت رزروها'
      return false
    }

    error.value = null
    currentPage.value = result.data.currentPage
    totalPages.value = result.data.totalPages
    total.value = result.data.total
    rawItems.value = rawItems.value.concat(result.data.data)
    return true
  }

  async function fetchPage(page: number) {
    const gen = generation
    loading.value = true
    await fetchOnePage(page, gen)
    if (gen === generation) loading.value = false
  }

  async function loadMore() {
    if (loading.value || needsFullData.value || allLoaded.value) return
    await fetchPage(currentPage.value + 1)
  }

  async function ensureFullyLoaded() {
    if (allLoaded.value || loadingAll.value) return
    const gen = generation
    loadingAll.value = true

    let next = currentPage.value + 1
    while (gen === generation && (currentPage.value === 0 || currentPage.value < totalPages.value)) {
      const ok = await fetchOnePage(next, gen)
      if (!ok) break
      next = currentPage.value + 1
    }

    if (gen === generation) loadingAll.value = false
  }

  watch(needsFullData, (needsFull) => {
    if (needsFull) ensureFullyLoaded()
  })

  function resetAndFetch() {
    generation += 1
    rawItems.value = []
    currentPage.value = 0
    totalPages.value = 1
    total.value = 0
    error.value = null
    if (needsFullData.value) ensureFullyLoaded()
    else fetchPage(1)
  }

  async function switchTab(next: BookingTab) {
    if (tab.value === next) return
    tab.value = next
    status.value = null
    search.value = ''
    sort.value = 'newest'
    resetAndFetch()
  }

  function setStatus(next: BookingStatus | null) {
    if (status.value === next) return
    status.value = next
    resetAndFetch()
  }

  function setSort(next: BookingSortOption) {
    sort.value = next
  }

  function setSearch(next: string) {
    search.value = next
  }

  async function cancelBooking(code: string) {
    const item = rawItems.value.find(i => i.code === code)
    if (!item) return false

    const result = await usePrivateApiFetch<{ message?: string }>(
      '/api/dashboard/bookings/cancel',
      { method: 'POST', body: { id: item.id, service: item.objectModel } },
      'خطا در لغو رزرو',
    )

    if (result.error) return false

    rawItems.value = rawItems.value.map(i =>
      i.code === code ? { ...i, status: 'cancelled', statusText: BOOKING_STATUS_LABELS.cancelled } : i,
    )
    return true
  }

  const items = computed(() => {
    if (!needsFullData.value) return rawItems.value
    return sortItems(rawItems.value.filter(item => matchesSearch(item, search.value)), sort.value)
  })

  const isBusy = computed(() => loading.value || loadingAll.value)
  const hasMore = computed(() => !needsFullData.value && !allLoaded.value)
  const isEmpty = computed(() => !isBusy.value && !error.value && items.value.length === 0)
  const isFiltered = computed(() => !!status.value || !!search.value.trim())

  return {
    tab, status, sort, search, items, loading: isBusy, loadingAll, error, total,
    hasMore, isEmpty, isFiltered,
    fetchPage, loadMore, switchTab, setStatus, setSort, setSearch, cancelBooking,
  }
}