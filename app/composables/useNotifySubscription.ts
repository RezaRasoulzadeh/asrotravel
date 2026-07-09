// app/composables/useNotifySubscription.ts
import type { WishableObjectModel } from '~/types/wishNotification.types'

const NOTIFICATION_TYPE = 'on_incredible_offer'

export function useNotifySubscription(objectModel: WishableObjectModel, objectId: Ref<number | null>) {
  const isSubscribed = ref(false)
  const loading = ref(false)

  async function subscribe() {
    const { isAuthenticated } = useAuth()

    if (!isAuthenticated.value) {
      const route = useRoute()
      await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
      return
    }

    if (loading.value || isSubscribed.value || !objectId.value) return

    loading.value = true

    const result = await usePrivateApiFetch(
      '/api/users/add-send-notification',
      {
        method: 'POST',
        body: {
          object_model: objectModel,
          object_id: objectId.value,
          send_notification: true,
          send_sms: true,
          type: NOTIFICATION_TYPE,
        },
      },
      'خطا در ثبت اطلاع‌رسانی',
    )

    loading.value = false

    if (result.error) return

    isSubscribed.value = true
    useToast().success('در صورت وجود پیشنهاد شگفت‌انگیز به شما اطلاع داده می‌شود')
  }

  return {
    isSubscribed,
    loading: readonly(loading),
    subscribe,
  }
}