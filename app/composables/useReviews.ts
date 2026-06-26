// composables/useReviews.ts

import type { ReviewListResponse, ReviewListParams } from '~/types/review.types'

export function useReviews(params: ReviewListParams) {
  const currentPage = ref(params.page ?? 1)

  const { data, status } = useFetch<ReviewListResponse>('/api/review/list', {
    query: computed(() => ({
      object_id: params.object_id,
      object_model: params.object_model,
      object_name: params.object_name,
      object_image: params.object_image ?? 'undefined',
      page: currentPage.value,
    })),
    key: () => `reviews-${params.object_model}-${params.object_id}-${currentPage.value}`,
    watch: [currentPage],
  })

  const loading = computed(() => status.value === 'pending')
  const error = computed(() => status.value === 'error')

  function goToPage(page: number) {
    currentPage.value = page
  }

  return {
    data,
    loading,
    error,
    currentPage,
    goToPage,
  }
}