<!-- app/components/cart/CheckoutSummary.vue -->
<script setup lang="ts">
import { Landmark } from 'lucide-vue-next'
import type { CheckoutResponse } from '~/types/checkout.types'

interface Props {
  checkout: CheckoutResponse
}

const props = defineProps<Props>()
const emit = defineEmits<{ pay: [gatewayKey: string] }>()

const selectedGateway = ref<string | null>(
  Object.keys(props.checkout.gateways)[0] ?? null
)
</script>

<template>
  <div dir="rtl" class="w-full">
    <div class="bg-base-100 rounded-3xl border border-base-300 p-6 md:p-8 shadow-sm">
      <div class="flex items-center justify-between pb-6 border-b border-base-300 mb-6">
        <h2 class="font-bold text-lg">{{ checkout.parent.title }}</h2>
        <div class="badge badge-neutral">{{ checkout.booking.total_guests }} نفر</div>
      </div>

      <div class="flex justify-between items-center bg-base-200/50 p-4 rounded-xl mb-6">
        <span class="text-base-content/70">مبلغ قابل پرداخت:</span>
        <span class="font-bold text-xl text-primary">{{ checkout.booking.total_display }}</span>
      </div>

      <div class="mb-6">
        <p class="text-base-content/70 mb-3 text-sm">درگاه پرداخت را انتخاب کنید:</p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            v-for="(gateway, key) in checkout.gateways"
            :key="key"
            class="flex items-center gap-3 border rounded-xl p-3 cursor-pointer transition-colors"
            :class="selectedGateway === key ? 'border-primary bg-primary/5' : 'border-base-300'"
          >
            <input
              v-model="selectedGateway"
              type="radio"
              :value="key"
              class="radio radio-primary radio-sm"
            >
            <img
              v-if="gateway.logo"
              :src="gateway.logo"
              :alt="gateway.name"
              class="size-8 rounded object-contain"
            >
            <Landmark v-else class="size-6 text-base-content/50" />
            <span class="text-sm">{{ gateway.name }}</span>
          </label>
        </div>
      </div>

      <button
        class="btn btn-primary btn-lg w-full"
        :disabled="!selectedGateway"
        @click="emit('pay', selectedGateway as string)"
      >
        پرداخت و تکمیل خرید
      </button>
    </div>
  </div>
</template>