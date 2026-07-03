// composables/useReviews.ts

import type { ReviewListParams, ReviewListResponse } from '~/types/review.types'
import { safeApiFetch } from '~/utils/api'

export function useReviews(params: ReviewListParams) {
  const currentPage = ref(params.page ?? 1)

  const data = ref<ReviewListResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchReviews() {
    loading.value = true

    const result = await safeApiFetch<ReviewListResponse>('/api/review/list', {
      query: {
        object_id: params.object_id,
        object_model: params.object_model,
        object_name: params.object_name,
        object_image: params.object_image ?? 'undefined',
        page: currentPage.value,
      },
    })

    data.value = result.data
    error.value = result.error
    loading.value = false
  }

  watch(currentPage, fetchReviews, { immediate: true })

  function goToPage(page: number) {
    currentPage.value = page
  }

  return {
    data: readonly(data),
    loading: readonly(loading),
    error: readonly(error),
    currentPage,
    goToPage,
    refresh: fetchReviews,
  }
}