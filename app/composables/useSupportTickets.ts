// app/composables/useSupportTickets.ts
import type { SupportSort, SupportTicketDto, SupportTicketListDtoResponse } from '~/types/support.types'

export function useSupportTickets(initialSort: SupportSort = 'all') {
  const sort = ref<SupportSort>(initialSort)

  const items = ref<SupportTicketDto[]>([])
  const currentPage = ref(0)
  const totalPages = ref(1)
  const total = ref(0)
  const allLoaded = computed(() => currentPage.value > 0 && currentPage.value >= totalPages.value)

  const loading = ref(true)
  const error = ref<string | null>(null)

  const auth = useAuth()
  let generation = 0

  async function fetchPage(page: number) {
    const gen = ++generation
    loading.value = true

    const result = await safeApiFetch<SupportTicketListDtoResponse>('/api/support/list', {
      query: { sort: sort.value, page },
    })

    if (gen !== generation) return

    if (result.status === 401) {
      await auth.handleSessionExpiry()
      return
    }

    if (result.error || !result.data) {
      error.value = result.error ?? 'خطا در دریافت تیکت‌ها'
      loading.value = false
      return
    }

    error.value = null
    currentPage.value = result.data.currentPage
    totalPages.value = result.data.totalPages
    total.value = result.data.total
    items.value = page === 1 ? result.data.data : items.value.concat(result.data.data)
    loading.value = false
  }

  async function loadMore() {
    if (loading.value || allLoaded.value) return
    await fetchPage(currentPage.value + 1)
  }

  function setSort(next: SupportSort) {
    if (sort.value === next) return
    sort.value = next
    currentPage.value = 0
    totalPages.value = 1
    items.value = []
    fetchPage(1)
  }

  const isEmpty = computed(() => !loading.value && !error.value && items.value.length === 0)
  const hasMore = computed(() => !allLoaded.value)

  return {
    sort, items, loading, error, total, hasMore, isEmpty,
    fetchPage, loadMore, setSort,
  }
}
