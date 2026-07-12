// app/composables/useFaq.ts

export interface SupportFaqItem {
  title: string
  content: string
}

interface FaqItemRaw {
  id?: number
  title: string
  description: string
  category?: number | string
}

export function useFaq(category: number | string = 1) {
  const faqs = ref<SupportFaqItem[]>([])
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function fetchFaqs() {
    loading.value = true
    error.value = null

    const result = await safeApiFetch<FaqItemRaw[]>('/api/faq/list', { query: { category } })

    faqs.value = (result.data ?? []).map(item => ({
      title: item.title,
      content: item.description,
    }))
    error.value = result.error
    loading.value = false
  }

  fetchFaqs()

  return {
    faqs,
    loading,
    error,
    refresh: fetchFaqs,
  }
}
