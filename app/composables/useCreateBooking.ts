// app/composables/useCreateBooking.ts
import type { CartAddPayload, CartAddResponse } from '~/types/cart.types'

export function useCreateBooking() {
  async function createBooking(
    payload: CartAddPayload,
  ): Promise<{ data: CartAddResponse | null; error: string | null }> {
    try {
      const data = await $fetch<CartAddResponse>('/api/booking/cart/add', {
        method: 'POST',
        body: payload,
      })
      return { data, error: null }
    } catch (error: any) {
      if (error?.statusCode === 401) {
        await useAuth().handleSessionExpiry()
        return { data: null, error: 'unauthorized' }
      }
      const message = error?.data?.statusMessage ?? 'خطا در ثبت رزرو، لطفا دوباره تلاش کنید'
      useToast().error(message)
      return { data: null, error: message }
    }
  }

  return { createBooking }
}