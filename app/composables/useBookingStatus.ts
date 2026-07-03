// app/composables/useBookingStatus.ts
import { io, type Socket } from 'socket.io-client'

export interface BookingStatusData {
  html: string
  access_to_paid: boolean
  count_down_time: number
  time_to_pay: string
  need_offline_accept: boolean | string
}

export function useBookingStatus(code: MaybeRefOrGetter<string>) {
  const statusHtml = ref('')
  const accessToPaid = ref(false)
  const needOfflineAccept = ref(false)
  const countdownDisplay = ref('')
  const countdownExpired = ref(false)
  const connected = ref(false)
  const primaryStatusMessage = ref('')
  const statusLoading = ref(true)

  let socket: Socket | null = null
  let timer: ReturnType<typeof setInterval> | null = null
  let remainingSeconds = 0

  function formatCountdown(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds - m * 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  function stopCountdown() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  function startCountdown() {
    stopCountdown()
    timer = setInterval(() => {
      remainingSeconds--
      if (remainingSeconds <= 0) {
        socket?.emit('end_booking_time_for_pay', { booking_code: toValue(code) })
        stopCountdown()
        countdownDisplay.value = ''
        countdownExpired.value = true
      } else {
        countdownDisplay.value = formatCountdown(remainingSeconds)
      }
    }, 1000)
  }

  function handleBookingStatus(data: BookingStatusData) {
    statusLoading.value = false
    statusHtml.value = data.html
    primaryStatusMessage.value = extractPrimaryMessage(data.html)
    accessToPaid.value = !!data.access_to_paid

    function extractPrimaryMessage(html: string): string {
      if (!import.meta.client) return ''
      const parsed = new DOMParser().parseFromString(html, 'text/html')
      return parsed.querySelector('div > div')?.textContent?.trim() ?? ''
    }

    stopCountdown()

    if (!data.need_offline_accept) {
      if (data.count_down_time > 0) {
        remainingSeconds = Math.floor(data.count_down_time)
        countdownExpired.value = false
        startCountdown()
      } else if (data.count_down_time < 0 && !data.access_to_paid) {
        countdownExpired.value = true
      }
    }
  }

  onMounted(() => {
    if (!import.meta.client) return

    socket = io('https://api.asrotravel.com/booking_check', {
      query: { booking_code: toValue(code) },
    })

    socket.on('connect', () => {
      connected.value = true
      socket?.emit('get_booking_status', { booking_code: toValue(code) })
    })

    socket.on('booking_status', handleBookingStatus)

    socket.on('panel_booking_status', (data: string) => {
      useToast().error(data)
    })

    socket.on('disconnect', () => {
      connected.value = false
      stopCountdown()
    })
  })

  onBeforeUnmount(() => {
    stopCountdown()
    socket?.off()
    socket?.disconnect()
  })

  return {
    statusHtml,
    primaryStatusMessage,
    accessToPaid,
    needOfflineAccept,
    countdownDisplay,
    countdownExpired,
    connected,
    statusLoading,
  }
}