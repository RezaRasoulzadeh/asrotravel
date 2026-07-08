<!-- app/components/cart/CheckoutBookingSummary.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { Clock, CalendarDays, BedDouble } from 'lucide-vue-next'
import type { CheckoutResponse } from '~/types/checkout.types'
import type { HotelCheckoutSummaryState } from '~/types/cart.types'
import { formatPrice } from '~/utils/price'

interface Props {
  checkout: CheckoutResponse
}

const { checkout } = defineProps<Props>()
const totals = useCheckoutTotals(() => checkout)

function toFaDigitsInString(str: string): string {
  const digits = Array.from({ length: 10 }, (_, i) => i.toLocaleString('fa-IR'))
  return str.replace(/\d/g, d => digits[Number(d)] ?? d)
}

const isHotel = computed(() => checkout.service_type === 'hotel')
const hotelSummary = useState<HotelCheckoutSummaryState | null>('hotel-checkout-summary', () => null)

const formattedTime = computed(() =>
  !isHotel.value && checkout.service.time_display ? toFaDigitsInString(checkout.service.time_display) : null
)
const isVip = computed(() => checkout.service.service_type === 'vip')

function stripZeroPad(jalali: string): string {
  if (!jalali) return ''
  return jalali.split('/').map(part => String(Number(part))).join('/')
}

function toDateOnly(value?: string | null): string | undefined {
  if (!value) return undefined
  const match = value.match(/^\d{4}-\d{2}-\d{2}/)
  return match ? match[0] : undefined
}

const { jalaliStart, jalaliEnd } = useJalaliDates(
  computed(() => hotelSummary.value?.startDate || toDateOnly(checkout.booking.start_date)),
  computed(() => hotelSummary.value?.endDate || toDateOnly(checkout.booking.end_date)),
)
const formattedCheckIn = computed(() => toFaDigitsInString(stripZeroPad(jalaliStart.value)))
const formattedCheckOut = computed(() => toFaDigitsInString(stripZeroPad(jalaliEnd.value)))

const nightCount = computed(() => {
  if (hotelSummary.value?.nightCount) return hotelSummary.value.nightCount
  const start = checkout.booking.start_date ? new Date(checkout.booking.start_date) : null
  const end = checkout.booking.end_date ? new Date(checkout.booking.end_date) : null
  if (!start || !end) return null
  const diff = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return diff > 0 ? diff : null
})
</script>

<template>
  <div dir="rtl" class="w-full">
    <div class="bg-base-100 rounded-3xl border border-base-300 p-6 shadow-sm">
      <div class="flex items-center gap-2 pb-4 border-b border-base-300 mb-4">
        <span class="size-2.5 rounded-full bg-primary shrink-0" />
        <h1 class="font-bold text-lg">{{ checkout.parent.title }}</h1>
      </div>

      <template v-if="isHotel">
        <div
          v-if="formattedCheckIn || formattedCheckOut"
          class="flex flex-col gap-2 pb-4 border-b border-base-300 mb-4">
          <div v-if="formattedCheckIn" class="flex items-center justify-between">
            <span class="text-sm text-base-content/60 flex items-center gap-1.5">
              <CalendarDays class="size-4" />
              تاریخ ورود:
            </span>
            <span class="text-sm font-medium">{{ formattedCheckIn }}</span>
          </div>
          <div v-if="formattedCheckOut" class="flex items-center justify-between">
            <span class="text-sm text-base-content/60 flex items-center gap-1.5">
              <CalendarDays class="size-4" />
              تاریخ خروج:
            </span>
            <span class="text-sm font-medium">{{ formattedCheckOut }}</span>
          </div>
          <div v-if="nightCount" class="flex items-center justify-between">
            <span class="text-sm text-base-content/60">مدت اقامت:</span>
            <span class="text-sm font-medium">{{ nightCount.toLocaleString('fa-IR') }} شب</span>
          </div>
        </div>

        <div v-if="hotelSummary" class="flex flex-col gap-2 pb-4 border-b border-base-300 mb-4">
          <div
            v-for="(room, index) in hotelSummary.rooms"
            :key="index"
            class="flex items-center justify-between gap-3 text-sm">
            <span class="flex items-center gap-1.5 text-base-content/70">
              <BedDouble class="size-3.5 text-primary shrink-0" />
              {{ room.title }}
            </span>
            <span class="font-medium">{{ formatPrice(room.priceWithOffer) }}</span>
          </div>
        </div>
      </template>

      <div v-else class="flex items-center justify-between pb-4 border-b border-base-300 mb-4">
        <span class="text-sm text-base-content/60 flex items-center gap-1.5">
          <Clock class="size-4" />
          ساعت: {{ formattedTime}}
        </span>
        <span class="text-sm text-base-content/60 flex items-center gap-1.5">
          <CalendarDays class="size-4" />
          {{ checkout.service.date_display }}
        </span>
      </div>

      <div class="flex flex-col gap-3 text-sm">
        <div v-if="!isHotel" class="flex justify-between items-center">
          <span class="text-base-content/60">{{ isVip ? 'قیمت پایه سانس:' : 'قیمت بلیت انتخاب شده:' }}</span>
          <span class="font-medium">{{ isVip ? formatPrice(checkout.service.price) : checkout.service.origin_price_display }}</span>
        </div>

        <div v-if="isVip && checkout.service.price_for_extra_person" class="flex justify-between items-center">
          <span class="text-base-content/60">هزینه نفرات اضافه:</span>
          <span class="font-medium">{{ formatPrice(checkout.service.price_for_extra_person) }}</span>
        </div>

        <div v-if="isHotel && hotelSummary?.extraPersonTotal" class="flex justify-between items-center">
          <span class="text-base-content/60">هزینه نفرات اضافه:</span>
          <span class="font-medium">{{ formatPrice(hotelSummary.extraPersonTotal) }}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-base-content/60">تعداد:</span>
          <span class="font-medium">{{ checkout.booking.total_guests.toLocaleString('fa-IR') }}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-base-content/60">مبلغ کل:</span>
          <span class="font-medium">{{ formatPrice(checkout.service.total_price) }}</span>
        </div>

        <div v-if="!totals.hasCoupon.value" class="flex justify-between items-center">
          <span class="text-base-content/60">تخفیف/هدیه:</span>
          <span class="font-medium text-success">{{ formatPrice(totals.offerAmount.value) }}</span>
        </div>

        <div v-else class="flex justify-between items-center">
          <span class="text-base-content/60">تخفیف کد تخفیف:</span>
          <span class="font-medium text-success">{{ checkout.booking.coupon_amount_display }}</span>
        </div>

        <div class="flex justify-between items-center pt-3 border-t border-base-300">
          <span class="font-bold">مجموع مبلغ رزرو:</span>
          <span class="font-bold text-lg text-primary">{{ formatPrice(totals.finalTotal.value) }}</span>
        </div>

        <template v-if="totals.hasDeposit.value">
          <div class="flex justify-between items-center">
            <span class="text-base-content/60">قابل پرداخت آنلاین (بیعانه):</span>
            <span class="font-medium text-primary">{{ formatPrice(totals.deposit.value) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-base-content/60">باقیمانده (پرداخت در محل):</span>
            <span class="font-medium">{{ formatPrice(totals.remainingAtVenue.value) }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>