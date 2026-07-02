<!-- app/pages/cart/checkout/[code].vue -->
<script setup lang="ts">
import { WifiOff } from 'lucide-vue-next'
import CartSteps from '~/components/cart/CartSteps.vue'
import CheckoutSummary from '~/components/cart/CheckoutSummary.vue'

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

const onPay = (gatewayKey: string) => {
  // TODO: pay endpoint — still unconfirmed
}
</script>

<template>
  <div class="container mx-auto p-4 md:p-8 mt-24">
    <CartSteps :current-step="2" />

    <div v-if="loading" class="flex justify-center p-12">
      <span class="loading loading-spinner loading-lg text-primary" />
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

    <CheckoutSummary v-else :checkout="checkout" @pay="onPay" />
  </div>
</template>