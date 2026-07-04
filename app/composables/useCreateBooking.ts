// app/composables/useCreateBooking.ts
import type { CartAddPayload, VipCartAddPayload, CartAddResponse } from '~/types/cart.types'

export function useCreateBooking() {
  async function createBooking(
    payload: CartAddPayload | VipCartAddPayload,
  ): Promise<{ data: CartAddResponse | null; error: string | null }> {
    const result = await usePrivateApiFetch<CartAddResponse>(
      '/api/booking/cart/add',
      { method: 'POST', body: payload },
      'خطا در ثبت رزرو، لطفا دوباره تلاش کنید',
    )

    return { data: result.data, error: result.error }
  }

  return { createBooking }
}