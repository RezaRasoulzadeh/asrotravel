// app/composables/useNewSupportTicket.ts
import type { NewSupportTicketPayload } from '~/types/support.types'

export function useNewSupportTicket() {
  const loading = ref(false)

  async function submit(payload: NewSupportTicketPayload): Promise<{ ok: boolean, error?: string }> {
    if (loading.value) return { ok: false }
    loading.value = true

    const body = new FormData()
    body.append('subject', payload.subject.trim())
    body.append('department', payload.department)
    body.append('priority', payload.priority)
    body.append('message', payload.message.trim())
    if (payload.file) body.append('file', payload.file)

    const result = await usePrivateApiFetch<{ success: boolean }>(
      '/api/support/new',
      { method: 'POST', body },
      'خطا در ثبت تیکت. لطفا دوباره تلاش کنید',
    )
    loading.value = false

    if (result.error || !result.data?.success) return { ok: false, error: result.error ?? undefined }

    return { ok: true }
  }

  return {
    loading: readonly(loading),
    submit,
  }
}