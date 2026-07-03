<!-- app/components/dashboard/BookingCard.vue -->
<script setup lang="ts">
import { Calendar, MapPin, PlayCircle, RotateCcw, Star, Ticket, Users, Wallet, Wallet2, X } from 'lucide-vue-next'
import type { DashboardBookingDto } from '~/types/dashboardBookings.types'
import { BOOKING_STATUS_ACTIONS, BOOKING_STATUS_BADGE, BOOKING_STATUS_LABELS, RESERVATION_CODE_VISIBLE_STATUSES } from '~/types/dashboardBookings.types'

const props = defineProps<{ booking: DashboardBookingDto }>()
const emit = defineEmits<{ cancel: [string] }>()

// TODO: flip to true once /cart/[code]/payment exists and is confirmed working.
const PAY_ENABLED = false

const cancelling = ref(false)

const statusLabel = computed(() =>
  BOOKING_STATUS_LABELS[props.booking.status as keyof typeof BOOKING_STATUS_LABELS] ?? props.booking.statusText,
)
const statusBadgeClass = computed(() =>
  BOOKING_STATUS_BADGE[props.booking.status as keyof typeof BOOKING_STATUS_BADGE] ?? 'badge-ghost',
)
const actions = computed(() =>
  BOOKING_STATUS_ACTIONS[props.booking.status as keyof typeof BOOKING_STATUS_ACTIONS] ?? [],
)

function toFaNumber(value: number | string): string {
  return Number(value).toLocaleString('fa-IR', { useGrouping: false })
}

// TODO: for mixed strings (e.g. "08:00 - 00:00") — Number.toLocaleString can't run on
// the whole string, so digits are derived from toLocaleString and swapped per-character.
function toFaDigitsInString(str: string): string {
  const digits = Array.from({ length: 10 }, (_, i) => i.toLocaleString('fa-IR'))
  return str.replace(/\d/g, d => digits[Number(d)] ?? d)
}

function formatCreatedAt(iso: string) {
  try {
    const date = new Date(iso)
    const { jy, jm, jd } = toJalali(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
    return `${toFaNumber(jy)}/${jm.toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}/${jd.toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}`
  }
  catch {
    return '—'
  }
}

const formattedCreated = computed(() => formatCreatedAt(props.booking.createdAt))
const formattedTime = computed(() => props.booking.timeDisplay ? toFaDigitsInString(props.booking.timeDisplay) : null)
const showReservationCode = computed(() =>
  RESERVATION_CODE_VISIBLE_STATUSES.includes(props.booking.status as typeof RESERVATION_CODE_VISIBLE_STATUSES[number])
  && !!props.booking.reservationCode,
)

const hasWalletUsage = computed(() => props.booking.walletTotalUsed > 0)
const hasDiscount = computed(() => !!props.booking.couponAmountDisplay && props.booking.couponAmountDisplay.trim() !== '۰ تومان')
const hasOffer = computed(() => !!props.booking.offerDisplay && props.booking.offerDisplay.trim() !== '۰ تومان')
const singleUrl = computed(() => `/${props.booking.objectModel.toLowerCase()}/${props.booking.slug ?? ''}`)
const continueUrl = computed(() => `/cart/checkout/${props.booking.code}`)

async function handleCancel() {
  if (!confirm('در صورت لغو، مطابق قوانین کسر هزینه اعمال می‌شود. ادامه می‌دهید؟')) return
  cancelling.value = true
  emit('cancel', props.booking.code)
  cancelling.value = false
}
</script>

<template>
  <div class="collapse collapse-arrow bg-base-100 border border-base-300 rounded-2xl">
    <input type="checkbox" class="peer">
    <div class="collapse-title flex items-center gap-3">
      <div class="flex-1 grid gap-1">
        <div class="flex items-center justify-between gap-2">
          <span class="font-medium truncate">{{ booking.title || '—' }}</span>
          <span class="text-primary text-sm whitespace-nowrap">{{ booking.totalDisplay }}</span>
        </div>
        <div class="flex items-center gap-3 text-xs text-base-content/60 flex-wrap">
          <span class="flex items-center gap-1"><Users :size="14" />{{ toFaNumber(booking.adultCount) }} نفر</span>
          <span class="flex items-center gap-1"><MapPin :size="14" />{{ booking.locationName ?? '—' }}</span>
          <span class="flex items-center gap-1"><Calendar :size="14" />{{ booking.dateDisplay }}</span>
          <span class="badge badge-sm" :class="statusBadgeClass">{{ statusLabel }}</span>
        </div>
      </div>
    </div>

    <div class="collapse-content">
      <div class="divider my-1" />

      <div class="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-base-content/70 mb-3">
        <p v-if="showReservationCode" class="flex items-center gap-1">
          <Ticket :size="14" />کد رزرو: {{ toFaNumber(booking.reservationCode!) }}
        </p>
        <p>تاریخ ثبت: {{ formattedCreated }}</p>
        <p v-if="formattedTime">ساعت: {{ formattedTime }}</p>
        <p v-if="booking.childCount > 0">تعداد کودک: {{ toFaNumber(booking.childCount) }} نفر</p>
      </div>

      <div class="bg-base-200/50 rounded-xl p-3 text-sm grid gap-1 mb-3">
        <div class="flex justify-between"><span class="text-base-content/60">مبلغ کل</span><span>{{ booking.totalDisplay }}</span></div>
        <div v-if="hasDiscount" class="flex justify-between text-success">
          <span>تخفیف کوپن</span><span>-{{ booking.couponAmountDisplay }}</span>
        </div>
        <div v-if="hasOffer" class="flex justify-between text-success">
          <span>تخفیف ویژه</span><span>-{{ booking.offerDisplay }}</span>
        </div>
        <div v-if="hasWalletUsage" class="flex items-center justify-between text-info">
          <span class="flex items-center gap-1"><Wallet :size="14" />استفاده از کیف پول</span>
          <span>{{ toFaNumber(booking.walletTotalUsed) }}</span>
        </div>
        <div class="flex justify-between font-medium border-t border-base-300 pt-1 mt-1">
          <span>پرداخت‌شده</span><span>{{ formatPrice(booking.paid) }}</span>
        </div>
        <div v-if="booking.payNow && actions.includes('pay')" class="flex justify-between text-warning">
          <span>باقی‌مانده برای پرداخت</span><span>{{ formatPrice(booking.payNow) }}</span>
        </div>
      </div>

      <p v-if="booking.customerNotes" class="text-xs text-base-content/50 mb-3">یادداشت: {{ booking.customerNotes }}</p>

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