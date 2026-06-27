// composables/useTicketSingle.ts

import type { Ref } from 'vue'
import type { TicketItem } from '~/types/ticket.types'
import type {
  BreadcrumbItem,
  GalleryImage,
  Ticket,
  TicketSeo,
  TicketSingleApiResponse,
} from '~/types/ticketSingle.types'
import { safeApiFetch } from '~/utils/api'

export function useTicketSingle(slug: string | Ref<string>) {
  const ticket = ref<Ticket | null>(null)
  const gallery = ref<GalleryImage[]>([])
  const seo = ref<TicketSeo | null>(null)
  const related = ref<TicketItem[]>([])
  const breadcrumb = ref<BreadcrumbItem[]>([])

  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTicket() {
    const value = toValue(slug)

    if (!value) {
      ticket.value = null
      gallery.value = []
      seo.value = null
      related.value = []
      breadcrumb.value = []
      return
    }

    loading.value = true

    const result = await safeApiFetch<TicketSingleApiResponse>(
      `/api/ticket/${encodeURIComponent(value)}/single`,
    )

    loading.value = false
    error.value = result.error

    ticket.value = result.data?.ticket ?? null
    gallery.value = result.data?.gallery ?? []
    seo.value = result.data?.seo ?? null
    related.value = result.data?.related ?? []
    breadcrumb.value = result.data?.breadcrumb_data ?? []
  }

  watch(
    () => toValue(slug),
    fetchTicket,
    { immediate: true },
  )

  return {
    ticket,
    gallery,
    seo,
    related,
    breadcrumb,
    loading,
    error,
    refresh: fetchTicket,
  }
}