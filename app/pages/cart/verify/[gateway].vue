<!-- app/pages/cart/verify/[gateway].vue -->
<script setup lang="ts">
import { AlertCircle, CheckCircle2, Copy, CopyCheck, Loader2, Ticket, Wallet, XCircle } from 'lucide-vue-next'
import type { BookingObjectModel, BookingStatus } from '~/types/dashboardBookings.types'
import { BOOKING_STATUS_BADGE, BOOKING_STATUS_LABELS, MODEL_TO_TAB } from '~/types/dashboardBookings.types'

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

const statusText = computed(() => result.value?.booking_data?.status_text as BookingStatus | undefined)
const statusLabel = computed(() => statusText.value ? (BOOKING_STATUS_LABELS[statusText.value] ?? statusText.value) : null)
const statusBadgeClass = computed(() => statusText.value ? (BOOKING_STATUS_BADGE[statusText.value] ?? 'badge-ghost') : 'badge-ghost')

const { qrDataUrl: reservationQrDataUrl } = useQrCode(computed(() => result.value?.booking_data?.ticket_code ?? null))

const bookingsListUrl = computed(() => {
  if (!isSuccess.value) return '/dashboard/bookings'

  const serviceType = route.query.service_type as BookingObjectModel | undefined
  const tab = serviceType ? MODEL_TO_TAB[serviceType] : undefined
  const reservation = result.value?.booking_data?.ticket_code

  const query: Record<string, string> = {}
  if (tab) query.tab = tab
  if (reservation) query.reservation = String(reservation)

  return { path: '/dashboard/bookings', query }
})

const copied = ref(false)
async function copyCode() {
  const code = result.value?.booking_data?.ticket_code
  if (!code) return
  await navigator.clipboard.writeText(String(code))
  copied.value = true
  setTimeout(() => { copied.value = false }, 1500)
}

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
        <h2 class="font-bold text-lg mb-1">رزرو با موفقیت انجام شد</h2>
        <p v-if="result?.booking_data?.booking_date" class="text-sm text-base-content/60 mb-6">{{ result.booking_data.booking_date }}</p>

        <template v-if="result?.booking_data">
          <div class="rounded-2xl bg-primary/10 border border-primary/20 p-4 mb-4 flex flex-col items-center">
            <img
              v-if="reservationQrDataUrl"
              :src="reservationQrDataUrl"
              alt="کد QR رزرو"
              class="size-32 rounded-lg bg-base-100 p-1.5 border border-primary/20 mb-3"
            >
            <p class="text-xs text-base-content/60 mb-1.5">کد رزرو</p>
            <div class="flex items-center justify-center gap-2">
              <span class="text-3xl font-extrabold tracking-wide text-primary font-mono">{{ result.booking_data.ticket_code }}</span>
              <button
                type="button" class="btn btn-ghost btn-xs btn-circle" :aria-label="'کپی کد رزرو'"
                @click="copyCode"
              >
                <CopyCheck v-if="copied" class="size-4 text-success" />
                <Copy v-else class="size-4" />
              </button>
            </div>
          </div>

          <ul class="text-sm text-right divide-y divide-base-300 rounded-2xl border border-base-300 overflow-hidden">
            <li class="flex items-center justify-between px-4 py-3">
              <span class="flex items-center gap-2 text-base-content/60"><Ticket :size="15" />تعداد بلیت</span>
              <span class="font-medium">{{ result.booking_data.ticket_quantity }}</span>
            </li>
            <li class="flex items-center justify-between px-4 py-3">
              <span class="flex items-center gap-2 text-base-content/60"><Wallet :size="15" />مبلغ پرداخت شده</span>
              <span class="font-medium">{{ result.booking_data.amount }}</span>
            </li>
            <li class="flex items-center justify-between px-4 py-3">
              <span class="text-base-content/60">وضعیت پرداخت</span>
              <span class="badge badge-sm" :class="statusBadgeClass">{{ statusLabel }}</span>
            </li>
          </ul>

          <div class="alert alert-soft mt-4 text-xs text-right rounded-xl">
            <AlertCircle :size="16" class="shrink-0" />
            <span>لطفا کد رزرو را در هنگام مراجعه به استخر همراه خود داشته باشید</span>
          </div>
        </template>
        <p v-else-if="result?.message" class="text-sm text-base-content/60">{{ result.message }}</p>
      </template>
      <template v-else-if="isFailure">
        <XCircle class="size-16 text-error mx-auto mb-4" />
        <h2 class="font-bold text-lg mb-2">پرداخت ناموفق بود</h2>
        <p class="text-sm text-base-content/60">{{ error || 'خطایی در تراکنش رخ داده است. لطفا مجددا تلاش کنید.' }}</p>
      </template>

      <div class="flex gap-2 mt-8">
        <NuxtLink to="/" class="btn btn-ghost flex-1 rounded-xl">بازگشت به صفحه اصلی</NuxtLink>
        <NuxtLink :to="bookingsListUrl" class="btn btn-primary flex-1 rounded-xl">مشاهده رزروها</NuxtLink>
      </div>
    </div>
  </div>
</template>