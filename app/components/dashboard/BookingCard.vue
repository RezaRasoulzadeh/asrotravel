<!-- app/components/dashboard/BookingCard.vue -->
<script setup lang="ts">
import { Calendar, CreditCard, MapPin, PlayCircle, RotateCcw, Star, Ticket, Users, Wallet, Wallet2, X } from 'lucide-vue-next'
import type { DashboardBooking } from '~/types/dashboardBookings.types'
import { BOOKING_STATUS_ACTIONS, BOOKING_STATUS_BADGE, BOOKING_STATUS_LABELS } from '~/types/dashboardBookings.types'

const props = defineProps<{ booking: DashboardBooking }>()
const emit = defineEmits<{ cancel: [number] }>()

// TODO: flip to true once /cart/[code]/payment exists and is confirmed working.
const PAY_ENABLED = false

const cancelling = ref(false)
const meta = computed(() => props.booking.booking_meta?.val)

const statusLabel = computed(() =>
  BOOKING_STATUS_LABELS[props.booking.status as keyof typeof BOOKING_STATUS_LABELS] ?? props.booking.status_text,
)
const statusBadgeClass = computed(() =>
  BOOKING_STATUS_BADGE[props.booking.status as keyof typeof BOOKING_STATUS_BADGE] ?? 'badge-ghost',
)
const actions = computed(() =>
  BOOKING_STATUS_ACTIONS[props.booking.status as keyof typeof BOOKING_STATUS_ACTIONS] ?? [],
)

function toFaDigits(value: number | string): string {
  const map = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(value).replace(/\d/g, d => map[Number(d)] ?? d)
}

function formatCreatedAt(iso: string) {
  try {
    const date = new Date(iso)
    const { jy, jm, jd } = toJalaliDash(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
    // TODO: duplicates logic that likely belongs in app/utils/date.ts or useJalaliDates — consolidate.
    return `${toFaDigits(jy)}/${toFaDigits(String(jm).padStart(2, '0'))}/${toFaDigits(String(jd).padStart(2, '0'))}`
  }
  catch {
    return '—'
  }
}

const formattedDate = computed(() => meta.value?.date_display ?? formatCreatedAt(props.booking.start_date))
const formattedTime = computed(() => meta.value?.time_display ?? '')
const formattedCreated = computed(() => formatCreatedAt(props.booking.created_at))

const adultCount = computed(() => meta.value?.quantity?.adult?.quantity ?? props.booking.total_guests)
const childCount = computed(() => meta.value?.quantity?.child?.quantity ?? 0)

const hasWalletUsage = computed(() => (props.booking.wallet_total_used ?? 0) > 0)
const hasDiscount = computed(() => Number(props.booking.coupon_amount) > 0)
const hasOffer = computed(() => !!props.booking.offer_display && props.booking.offer_display.trim() !== '۰ تومان')
const singleUrl = computed(() => `/${props.booking.object_model.toLowerCase()}/${props.booking.service?.slug ?? ''}`)
const continueUrl = computed(() => `/cart/checkout/${props.booking.code}`)

async function handleCancel() {
  if (!confirm('در صورت لغو، مطابق قوانین کسر هزینه اعمال می‌شود. ادامه می‌دهید؟')) return
  cancelling.value = true
  emit('cancel', props.booking.id)
  cancelling.value = false
}
</script>

<template>
  <div class="collapse collapse-arrow bg-base-100 border border-base-300 rounded-2xl">
    <input type="checkbox" class="peer">
    <div class="collapse-title flex items-center gap-3">
      <div class="flex-1 grid gap-1">
        <div class="flex items-center justify-between gap-2">
          <span class="font-medium truncate">{{ booking.service?.title ?? '—' }}</span>
          <span class="text-primary text-sm whitespace-nowrap">{{ booking.total_display }}</span>
        </div>
        <div class="flex items-center gap-3 text-xs text-base-content/60 flex-wrap">
          <span class="flex items-center gap-1"><Users :size="14" />{{ adultCount.toLocaleString('fa-IR') }} نفر</span>
          <span class="flex items-center gap-1"><MapPin :size="14" />{{ booking.service?.location?.name ?? '—' }}</span>
          <span class="flex items-center gap-1"><Calendar :size="14" />{{ formattedDate }}</span>
          <span class="badge badge-sm" :class="statusBadgeClass">{{ statusLabel }}</span>
        </div>
      </div>
    </div>

    <div class="collapse-content">
      <div class="divider my-1" />

      <div class="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-base-content/70 mb-3">
        <p>کد رزرو: <span class="font-mono">{{ booking.code }}</span></p>
        <p v-if="meta?.reservation_code" class="flex items-center gap-1">
          <Ticket :size="14" />کد پیگیری: <span class="font-mono">{{ toFaDigits(meta.reservation_code) }}</span>
        </p>
        <p>تاریخ ثبت: {{ formattedCreated }}</p>
        <p v-if="formattedTime">ساعت: {{ formattedTime }}</p>
        <p v-if="childCount > 0">تعداد کودک: {{ childCount.toLocaleString('fa-IR') }} نفر</p>
        <p v-if="booking.gateway" class="flex items-center gap-1"><CreditCard :size="14" />درگاه پرداخت: {{ booking.gateway }}</p>
      </div>

      <div class="bg-base-200/50 rounded-xl p-3 text-sm grid gap-1 mb-3">
        <div class="flex justify-between"><span class="text-base-content/60">مبلغ کل</span><span>{{ booking.total_display }}</span></div>
        <div v-if="hasDiscount" class="flex justify-between text-success">
          <span>تخفیف کوپن</span><span>-{{ booking.coupon_amount_display }}</span>
        </div>
        <div v-if="hasOffer" class="flex justify-between text-success">
          <span>تخفیف ویژه</span><span>-{{ booking.offer_display }}</span>
        </div>
        <div v-if="hasWalletUsage" class="flex items-center justify-between text-info">
          <span class="flex items-center gap-1"><Wallet :size="14" />استفاده از کیف پول</span>
          <span>{{ booking.wallet_total_used!.toLocaleString('fa-IR') }}</span>
        </div>
        <div class="flex justify-between font-medium border-t border-base-300 pt-1 mt-1">
          <span>پرداخت‌شده</span><span>{{ booking.paid ?? '—' }}</span>
        </div>
        <div v-if="booking.pay_now && actions.includes('pay')" class="flex justify-between text-warning">
          <span>باقی‌مانده برای پرداخت</span><span>{{ booking.pay_now }}</span>
        </div>
      </div>

      <p v-if="booking.customer_notes" class="text-xs text-base-content/50 mb-3">یادداشت: {{ booking.customer_notes }}</p>

      <div class="flex flex-wrap gap-2">
        <NuxtLink v-if="actions.includes('continue')" :to="continueUrl" class="btn btn-sm btn-primary gap-1">
          <PlayCircle :size="16" />ادامه رزرو
        </NuxtLink>

        <NuxtLink v-if="actions.includes('pay') && PAY_ENABLED" :to="`/cart/${booking.code}/payment`" class="btn btn-sm btn-primary gap-1">
          <Wallet2 :size="16" />پرداخت
        </NuxtLink>

        <NuxtLink v-if="actions.includes('rebook')" :to="singleUrl" class="btn btn-sm btn-soft btn-primary gap-1">
          <RotateCcw :size="16" />رزرو مجدد
        </NuxtLink>

        <NuxtLink v-if="actions.includes('review')" :to="`${singleUrl}#comment`" class="btn btn-sm btn-soft gap-1">
          <Star :size="16" />ثبت نظر
        </NuxtLink>

        <button v-if="actions.includes('cancel')" type="button" class="btn btn-sm btn-soft btn-error gap-1" :disabled="cancelling" @click="handleCancel">
          <X :size="16" />لغو رزرو
        </button>
      </div>
    </div>
  </div>
</template>