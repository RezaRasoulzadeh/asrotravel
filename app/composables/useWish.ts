// app/composables/useWish.ts
import type { AddWishResponse, WishableObjectModel } from '~/types/wishNotification.types'

export function useWish(
  objectModel: WishableObjectModel,
  objectId: Ref<number | null>,
  initialWish?: Ref<boolean | null | undefined>,
) {
  const isWish = ref(false)
  const loading = ref(false)
  let initializedFromSource = false

  if (initialWish) {
    watch(
      initialWish,
      (val) => {
        if (initializedFromSource || val === null || val === undefined) return
        isWish.value = val
        initializedFromSource = true
      },
      { immediate: true },
    )
  }

  async function toggleWish() {
    const { isAuthenticated } = useAuth()

    if (!isAuthenticated.value) {
      const route = useRoute()
      await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
      return
    }

    if (loading.value || !objectId.value) return

    loading.value = true

    const result = await usePrivateApiFetch<AddWishResponse>(
      '/api/users/add-wish',
      {
        method: 'POST',
        body: { object_model: objectModel, object_id: objectId.value },
      },
      'خطا در ثبت علاقه‌مندی',
    )

    loading.value = false

    if (result.error || !result.data) return

    initializedFromSource = true
    isWish.value = result.data.is_wish
    useToast().success(isWish.value ? 'به علاقه‌مندی‌ها اضافه شد' : 'از علاقه‌مندی‌ها حذف شد')
  }

  return {
    isWish,
    loading: readonly(loading),
    toggleWish,
  }
}