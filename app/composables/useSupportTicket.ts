// app/composables/useSupportTicket.ts
import type { SupportTicketDto, SupportTicketShowDto } from '~/types/support.types'

export function useSupportTicket(id: string | number) {
  const ticket = ref<Partial<SupportTicketDto> | null>(null)
  const messages = ref<SupportTicketShowDto['messages']>([])

  const loading = ref(true)
  const error = ref<string | null>(null)
  const sending = ref(false)

  const { handleSessionExpiry } = useAuth()

  async function fetchTicket() {
    loading.value = true
    error.value = null

    const result = await safeApiFetch<SupportTicketShowDto>(`/api/support/${id}`)

    if (result.status === 401) {
      await handleSessionExpiry()
      return
    }

    if (result.error || !result.data) {
      error.value = result.error ?? 'خطا در دریافت تیکت'
      loading.value = false
      return
    }

    ticket.value = result.data.ticket
    messages.value = result.data.messages
    loading.value = false
  }

  async function sendReply(message: string, file?: File | null): Promise<{ ok: boolean, error?: string }> {
    if (sending.value || !message.trim()) return { ok: false }
    sending.value = true

    const body = new FormData()
    body.append('message', message.trim())
    if (file) body.append('file', file)

    const result = await usePrivateApiFetch<SupportTicketShowDto['messages'][number]>(
      `/api/support/${id}/answer`,
      { method: 'POST', body },
      'خطا در ارسال پاسخ. لطفا دوباره تلاش کنید',
    )
    sending.value = false

    if (result.error || !result.data) return { ok: false, error: result.error ?? undefined }

    messages.value = [...messages.value, result.data]
    return { ok: true }
  }

  return {
    ticket,
    messages,
    loading,
    error,
    sending: readonly(sending),
    fetchTicket,
    sendReply,
  }
}
