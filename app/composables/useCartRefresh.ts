// app/composables/useCartRefresh.ts
import type { CartRefreshPayload, CartAddResponse } from '~/types/cart.types'

const REFRESH_COOLDOWN_MS = 10000

export function useCartRefresh() {
  const refreshedAt = useState<Record<string, number>>('cart-refresh-timestamps', () => ({}))
  const refreshing = ref(false)

  function canRefresh(code: string): boolean {
    const last = refreshedAt.value[code]
    if (!last) return true
    return Date.now() - last > REFRESH_COOLDOWN_MS
  }

  async function refreshCartPrice(code: string): Promise<{ data: CartAddResponse | null; error: string | null }> {
    if (!canRefresh(code) || refreshing.value) {
      return { data: null, error: null }
    }

    refreshing.value = true
    refreshedAt.value[code] = Date.now()

    try {
      const payload: CartRefreshPayload = { booking_code: code }
      const result = await usePrivateApiFetch<CartAddResponse>(
        '/api/booking/cart/add',
        { method: 'POST', body: payload },
        'خطا در به‌روزرسانی قیمت رزرو',
      )

      return { data: result.data, error: result.error }
    } finally {
      refreshing.value = false
    }
  }

  return { refreshCartPrice, refreshing }
}
