<!-- app/pages/cart/checkout/[code].vue -->
<script setup lang="ts">
import { WifiOff } from 'lucide-vue-next'
import CartSteps from '~/components/cart/CartSteps.vue'
import CheckoutBookingSummary from '~/components/cart/CheckoutBookingSummary.vue'
import CheckoutSummary from '~/components/cart/CheckoutSummary.vue'
import LoadingState from '~/components/ui/LoadingState.vue'

const { isAuthenticated } = useAuth()
const route = useRoute()

if (!isAuthenticated.value) {
  useToast().error('برای ادامه باید وارد حساب کاربری خود شوید')
  await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
}

const code = computed(() => route.params.code as string)

const { checkout, loading, error } = isAuthenticated.value
  ? useCheckout(code)
  : { checkout: ref(null), loading: ref(false), error: ref(null) }

function onPay(payload: { gateway: string; credit: number; howToPay: 'full' | 'deposit' }) {
  // TODO: pay endpoint — still unconfirmed (old code's $api.cart.doCheckout)
}
</script>

<template>
  <div class="container mx-auto p-4 md:p-8 mt-24" dir="rtl">
    <CartSteps :current-step="3" />

    <div v-if="loading" class="flex justify-center p-12">
      <LoadingState v-if="loading" label="در حال دریافت اطلاعات پرداخت..." />
    </div>

    <div
      v-else-if="error || !checkout"
      class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4"
    >
      <div class="bg-error/10 rounded-full p-4">
        <WifiOff class="size-8 text-error" />
      </div>
      <p class="text-base-content/50">خطا در دریافت اطلاعات پرداخت</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <CheckoutBookingSummary :checkout="checkout" />
      <CheckoutSummary :checkout="checkout" @pay="onPay" />
    </div>
  </div>
</template>