<!-- app/components/cart/CheckoutBookingSummary.vue -->
<script setup lang="ts">
import { MapPin, Clock } from 'lucide-vue-next'
import type { CheckoutResponse } from '~/types/checkout.types'
import { formatPrice } from '~/utils/price'

interface Props {
  checkout: CheckoutResponse
}

defineProps<Props>()
</script>

<template>
  <div dir="rtl" class="w-full">
    <div class="bg-base-100 rounded-3xl border border-base-300 p-6 shadow-sm">
      <div class="flex items-center gap-2 pb-4 border-b border-base-300 mb-4">
        <span class="size-2.5 rounded-full bg-primary shrink-0" />
        <h1 class="font-bold text-lg">{{ checkout.parent.title }}</h1>
      </div>

      <div class="flex items-center justify-between pb-4 border-b border-base-300 mb-4">
        <span class="text-sm text-base-content/60 flex items-center gap-1.5">
          <Clock class="size-4" />
          ساعت: {{ checkout.service.time_display }}
        </span>
        <span class="text-sm text-base-content/60 flex items-center gap-1.5">
          <MapPin class="size-4" />
          {{ checkout.service.date_display }}
        </span>
      </div>

      <div class="flex flex-col gap-3 text-sm">
        <div class="flex justify-between items-center">
          <span class="text-base-content/60">قیمت بلیت انتخاب شده:</span>
          <span class="font-medium">{{ checkout.service.origin_price_display }}</span>
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
          <span class="font-medium text-error">{{ checkout.booking.offer_display }}</span>
        </div>

        <div class="flex justify-between items-center pt-3 border-t border-base-300">
          <span class="font-bold">مجموع مبلغ قابل پرداخت:</span>
          <span class="font-bold text-lg text-primary">{{ checkout.booking.total_display }}</span>
        </div>
      </div>
    </div>
  </div>
</template>