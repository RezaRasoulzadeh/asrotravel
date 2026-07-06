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

function toFaDigitsInString(str: string): string {
  const digits = Array.from({ length: 10 }, (_, i) => i.toLocaleString('fa-IR'))
  return str.replace(/\d/g, d => digits[Number(d)] ?? d)
}

const isHotel = computed(() => checkout.service_type === 'hotel')
// checkout GET doesn't return per-room detail for hotel bookings; read what
// was persisted client-side right before navigating to checkout (see hotel/[slug].vue)
const hotelSummary = useState<HotelCheckoutSummaryState | null>('hotel-checkout-summary', () => null)

const formattedTime = computed(() =>
  !isHotel.value && checkout.service.time_display ? toFaDigitsInString(checkout.service.time_display) : null
)
const isVip = computed(() => checkout.service.service_type === 'vip')
</script>

<template>
  <div dir="rtl" class="w-full">
    <div class="bg-base-100 rounded-3xl border border-base-300 p-6 shadow-sm">
      <div class="flex items-center gap-2 pb-4 border-b border-base-300 mb-4">
        <span class="size-2.5 rounded-full bg-primary shrink-0" />
        <h1 class="font-bold text-lg">{{ checkout.parent.title }}</h1>
      </div>

      <template v-if="isHotel">
        <div v-if="hotelSummary" class="flex items-center justify-between pb-4 border-b border-base-300 mb-4">
          <span class="text-sm text-base-content/60 flex items-center gap-1.5">
            <CalendarDays class="size-4" />
            {{ hotelSummary.nightCount.toLocaleString('fa-IR') }} شب
          </span>
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

        <div class="flex justify-between items-center">
          <span class="text-base-content/60">تعداد:</span>
          <span class="font-medium">{{ checkout.booking.total_guests.toLocaleString('fa-IR') }}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-base-content/60">مبلغ کل:</span>
          <span class="font-medium">{{ formatPrice(checkout.booking.total_before_discount) }}</span>
        </div>

        <div class="flex justify-between items-center">
          <span class="text-base-content/60">تخفیف/هدیه:</span>
          <span class="font-medium text-success">{{ checkout.booking.offer_display }}</span>
        </div>

        <div class="flex justify-between items-center pt-3 border-t border-base-300">
          <span class="font-bold">مجموع مبلغ رزرو:</span>
          <span class="font-bold text-lg text-primary">{{ checkout.booking.total_display }}</span>
        </div>

        <template v-if="checkout.booking.deposit && Number(checkout.booking.deposit) < Number(checkout.booking.total)">
          <div class="flex justify-between items-center">
            <span class="text-base-content/60">قابل پرداخت آنلاین (بیعانه):</span>
            <span class="font-medium text-primary">{{ formatPrice(checkout.booking.deposit) }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-base-content/60">باقیمانده (پرداخت در محل):</span>
            <span class="font-medium">{{ formatPrice(Number(checkout.booking.total) - Number(checkout.booking.deposit)) }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>