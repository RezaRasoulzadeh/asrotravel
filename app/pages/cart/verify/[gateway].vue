<!-- app/pages/cart/verify/[gateway].vue -->
<script setup lang="ts">
import { CheckCircle2, Loader2, XCircle } from 'lucide-vue-next'

const route = useRoute()
const gateway = computed(() => route.params.gateway as string)

const { confirming, result, error, confirm } = useConfirmPayment()

onMounted(() => {
  const query = Object.fromEntries(
    Object.entries(route.query).map(([key, val]) => [key, Array.isArray(val) ? (val[0] ?? '') : (val ?? '')])
  ) as Record<string, string>

  confirm(gateway.value, query)
})

const isSuccess = computed(() => !confirming.value && !error.value && !!result.value)
const isFailure = computed(() => !confirming.value && (!!error.value || !result.value))

useHead({ title: 'رسید پرداخت' })
</script>

<template>
  <div class="container mx-auto p-4 md:p-8 mt-24 max-w-lg" dir="rtl">
    <div v-if="confirming" class="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 class="size-8 animate-spin text-primary" />
      <p class="text-sm text-base-content/60">در حال بررسی نتیجه پرداخت...</p>
    </div>

    <div v-else class="bg-base-100 rounded-3xl border border-base-300 p-8 text-center">
      <template v-if="isSuccess">
        <CheckCircle2 class="size-16 text-success mx-auto mb-4" />
        <h2 class="font-bold text-lg mb-2">پرداخت با موفقیت انجام شد</h2>
        <p v-if="result?.message" class="text-sm text-base-content/60">{{ result.message }}</p>
      </template>
      <template v-else-if="isFailure">
        <XCircle class="size-16 text-error mx-auto mb-4" />
        <h2 class="font-bold text-lg mb-2">پرداخت ناموفق بود</h2>
        <p class="text-sm text-base-content/60">{{ error || 'خطایی در تراکنش رخ داده است. لطفا مجددا تلاش کنید.' }}</p>
      </template>

      <div class="flex gap-2 mt-8">
        <NuxtLink to="/" class="btn btn-ghost flex-1 rounded-xl">بازگشت به صفحه اصلی</NuxtLink>
        <NuxtLink to="/dashboard/bookings" class="btn btn-primary flex-1 rounded-xl">مشاهده رزروها</NuxtLink>
      </div>
    </div>
  </div>
</template>