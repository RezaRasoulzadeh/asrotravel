// composables/usePlaceSearchAttributes.ts
export function usePlaceSearchAttributes() {
  const categories = ref<any[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAttributes(cat = '') {
    loading.value = true
    error.value = null
    const { data, error: err } = await safeApiFetch<any>('/api/place/attributes', {
      query: { cat }
    })
    if (err) error.value = err
    else categories.value = data?.categories ?? []
    loading.value = false
  }

  return { categories, loading, error, fetchAttributes }
}