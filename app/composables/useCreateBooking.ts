// app/composables/useCreateBooking.ts
import type { CartAddPayload, VipCartAddPayload, HotelCartAddPayload, CartAddResponse } from '~/types/cart.types'

export function useCreateBooking() {
  async function createBooking(
    payload: CartAddPayload | VipCartAddPayload | HotelCartAddPayload,
  ): Promise<{ data: CartAddResponse | null; error: string | null }> {
    const { referralHeaders } = useReferral()

    const result = await usePrivateApiFetch<CartAddResponse>(
      '/api/booking/cart/add',
      { method: 'POST', body: payload, headers: referralHeaders() },
      'خطا در ثبت رزرو، لطفا دوباره تلاش کنید',
    )

    return { data: result.data, error: result.error }
  }

  return { createBooking }
}