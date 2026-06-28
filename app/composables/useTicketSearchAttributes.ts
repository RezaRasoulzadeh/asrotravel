// composables/useTicketSearchAttributes.ts
import type { TicketSearchPageAttributes, TicketCategory } from '~/types/ticket.types'

const fetchPromises = new Map<string, Promise<TicketSearchPageAttributes>>()

export function useTicketSearchAttributes() {
  const categories = ref<TicketCategory[]>([])
  const priceRange = ref<{ min: number; max: number }>({ min: 0, max: 40000000 })
  const loading = ref(false)
  const error = ref<string | null>(null)

  const cache = useState<Record<string, TicketSearchPageAttributes>>(
    'ticket-search-attributes-cache',
    () => ({})
  )

  function applyData(data: TicketSearchPageAttributes) {
    categories.value = data.categories ?? []
    priceRange.value = {
      min: Number(data.min_max_range?.min_price ?? 0),
      max: Number(data.min_max_range?.max_price ?? 40000000),
    }
  }

  async function fetchAttributes(locationSlug = '') {
    const key = locationSlug || '__all__'

    if (cache.value[key]) {
      applyData(cache.value[key])
      return
    }

    if (fetchPromises.has(key)) {
      loading.value = true
      try {
        const data = await fetchPromises.get(key)!
        applyData(data)
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'خطا در دریافت اطلاعات فیلترها'
      } finally {
        loading.value = false
      }
      return
    }

    loading.value = true
    error.value = null

    const promise = safeApiFetch<TicketSearchPageAttributes>(
      `/api/ticket/search-page-attributes?location=${encodeURIComponent(locationSlug)}`
    ).then(({ data, error: fetchError }) => {
      if (fetchError || data == null) {
        throw new Error(fetchError ?? 'خطا در دریافت اطلاعات فیلترها')
      }
      return data
    })

    fetchPromises.set(key, promise)

    try {
      const data = await promise
      cache.value[key] = data
      applyData(data)
    } catch (e) {
      fetchPromises.delete(key)
      error.value = e instanceof Error ? e.message : 'خطا در دریافت اطلاعات فیلترها'
    } finally {
      loading.value = false
    }
  }

  return {
    categories: readonly(categories),
    priceRange: readonly(priceRange),
    loading: readonly(loading),
    error: readonly(error),
    fetchAttributes,
  }
}