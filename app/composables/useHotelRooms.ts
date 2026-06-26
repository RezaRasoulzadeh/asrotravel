// composables/useHotelRooms.ts
import type { HotelRoom, HotelRoomSearchParams } from '@/types/hotelSingle.types'

function defaultDates(): { start_date: string; end_date: string } {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  return { start_date: fmt(today), end_date: fmt(tomorrow) }
}

export function useHotelRooms(hotelId: MaybeRefOrGetter<number | null>) {
  const rooms = ref<HotelRoom[]>([])
  const loading = ref(false)
  const error = ref(false)
  let activeController: AbortController | null = null
  let activeRequestId = 0
  let stopHotelWatch: (() => void) | null = null

  const params = ref<HotelRoomSearchParams>({
    adults: 1,
    children: 0,
    ...defaultDates(),
  })

  function stopLoading(requestId?: number) {
    if (requestId !== undefined && activeRequestId !== requestId) return

    activeController = null
    loading.value = false
  }

  function reset() {
    activeController?.abort()
    activeController = null
    activeRequestId += 1
    rooms.value = []
    loading.value = false
    error.value = false
  }

  async function fetch() {
    const id = toValue(hotelId)
    if (!id) {
      reset()
      return
    }

    activeController?.abort()
    const controller = new AbortController()
    const requestId = activeRequestId + 1
    activeRequestId = requestId
    activeController = controller

    loading.value = true
    error.value = false

    try {
      const res = await $fetch<HotelRoom[] | { data?: HotelRoom[] }>(`/api/hotel/rooms/${id}`, {
        method: 'POST',
        body: params.value,
        signal: controller.signal,
      })
      if (activeRequestId === requestId) {
        rooms.value = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : [])
      }
    } catch (err: any) {
      if (activeRequestId === requestId && err?.name !== 'AbortError') {
        error.value = true
      }
    } finally {
      stopLoading(requestId)
    }
  }

  function setParams(p: Partial<HotelRoomSearchParams>) {
    params.value = { ...params.value, ...p }
  }

  async function search(p?: Partial<HotelRoomSearchParams>) {
    if (p) setParams(p)
    return await fetch()
  }

  if (import.meta.client) {
    onMounted(() => {
      stopHotelWatch = watch(
        () => toValue(hotelId),
        (id) => {
          if (id) {
            fetch()
            return
          }

          reset()
        },
        { immediate: true },
      )
    })

    onBeforeUnmount(() => {
      stopHotelWatch?.()
      stopHotelWatch = null
      reset()
    })
  }

  return { rooms, params, loading, error, search, fetch }
}
