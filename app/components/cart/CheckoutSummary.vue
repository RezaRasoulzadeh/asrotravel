<!-- app/components/cart/CheckoutSummary.vue -->
<script setup lang="ts">
import { Landmark } from 'lucide-vue-next'
import type { CheckoutResponse } from '~/types/checkout.types'

interface Props {
  checkout: CheckoutResponse
}

const props = defineProps<Props>()
const emit = defineEmits<{ pay: [payload: { gateway: string; credit: number; howToPay: 'full' | 'deposit' }] }>()

const { user } = useAuth()

const { statusHtml, primaryStatusMessage, accessToPaid, countdownDisplay, countdownExpired } =
  useBookingStatus(props.checkout.booking.booking_code)

const selectedGateway = ref<string | null>(
  Object.keys(props.checkout.gateways)[0] ?? null
)

const hasDiscountCode = ref(false)

const useWallet = ref(false)
const walletCredit = ref(0)

const payableTotal = computed(() =>
  Number(props.checkout.booking.deposit || props.checkout.booking.total)
)

const userWalletBalance = computed(() => Number(user.value?.wallet?.balance ?? 0))

const neededCredit = computed(() => {
  return Math.ceil(
    userWalletBalance.value > payableTotal.value
      ? payableTotal.value
      : payableTotal.value - userWalletBalance.value
  )
})

watch(useWallet, (enabled) => {
  walletCredit.value = enabled && userWalletBalance.value > 0
    ? Math.min(userWalletBalance.value, neededCredit.value)
    : 0
})

const remainingAfterWallet = computed(() => payableTotal.value - walletCredit.value)
const needsGateway = computed(() => remainingAfterWallet.value > 0)

const payDisabled = computed(() =>
  !accessToPaid.value || (needsGateway.value && !selectedGateway.value)
)

function onPayClick() {
  if (useWallet.value && userWalletBalance.value <= 0) {
    useToast().error('مجاز به پرداخت از طریق کیف پول نیستید.')
    return
  }

  emit('pay', {
    gateway: selectedGateway.value ?? '',
    credit: walletCredit.value,
    howToPay: useWallet.value ? 'deposit' : 'full',
  })
}
</script>

<template>
  <div dir="rtl" class="w-full flex flex-col gap-4">
    <div class="bg-base-100 rounded-3xl border border-base-300 p-6 shadow-sm">
      <div class="flex justify-between items-center">
        <span class="text-base-content/70">مبلغ قابل پرداخت:</span>
        <span class="font-bold text-xl text-primary">{{ checkout.booking.total_display }}</span>
      </div>
    </div>

    <div class="bg-base-100 rounded-3xl border border-base-300 p-6 shadow-sm">
      <label class="flex items-center justify-between cursor-pointer">
        <span class="text-sm text-base-content/70">کد تخفیف دارید؟</span>
        <input v-model="hasDiscountCode" type="checkbox" class="toggle toggle-primary toggle-sm" disabled>
      </label>
      <!-- TODO: offer-code input + submit — needs the real endpoint before this can be functional -->
    </div>

    <div class="bg-base-100 rounded-3xl border border-base-300 p-6 shadow-sm">
      <h3 class="font-bold text-base mb-4 pb-4 border-b border-base-300">پرداخت</h3>

      <label class="flex items-center gap-3 cursor-pointer">
        <input v-model="useWallet" type="checkbox" class="toggle toggle-primary toggle-sm">
        <span class="text-sm">پرداخت از کیف پول</span>
      </label>

      <ul v-if="useWallet" class="mt-4 space-y-2 text-sm">
        <li class="flex justify-between">
          <span class="text-base-content/70">اعتبار کیف پول شما:</span>
          <span class="text-primary font-medium">{{ userWalletBalance.toLocaleString('fa-IR') }} تومان</span>
        </li>
        <li class="flex justify-between items-center">
          <span class="text-base-content/70">اعتبار مورد نیاز:</span>
          <span class="cursor-pointer text-base-content/80" @click="walletCredit = neededCredit">
            {{ neededCredit.toLocaleString('fa-IR') }} تومان
          </span>
        </li>
        <li class="flex justify-between items-center gap-3">
          <span class="text-base-content/70 shrink-0">مبلغ پرداخت از کیف پول:</span>
          <input
            v-model.number="walletCredit"
            type="number"
            :max="neededCredit"
            min="0"
            step="1000"
            class="input input-bordered input-sm w-32 text-left"
          >
        </li>
      </ul>

      <div v-if="needsGateway" class="mt-4">
        <div class="bg-success/10 text-success text-xs rounded-xl px-3 py-2 mb-3">
          پرداخت با تمام کارت‌های بانکی عضو شبکه شتاب.
        </div>
        <div class="flex gap-3 flex-wrap">
          <label
            v-for="(gateway, key) in checkout.gateways"
            :key="key"
            class="flex flex-col items-center justify-center gap-1 border rounded-xl w-24 h-24 cursor-pointer transition-colors"
            :class="selectedGateway === key ? 'border-primary border-2 text-primary shadow-sm shadow-primary/30' : 'border-base-300'"
          >
            <input v-model="selectedGateway" type="radio" :value="key" class="hidden">
            <img
              v-if="gateway.logo"
              :src="gateway.logo"
              :alt="gateway.name"
              class="rounded-xl h-full object-contain p-2"
            >
            <template v-else>
              <Landmark class="size-6 text-base-content/50" />
              <span class="text-xs text-center">{{ gateway.name }}</span>
            </template>
          </label>
        </div>
      </div>

      <button
        class="btn btn-primary btn-lg w-full mt-4"
        :disabled="payDisabled"
        @click="onPayClick"
      >
        پرداخت و دریافت رسید
      </button>

      <div v-if="primaryStatusMessage" class="mt-4 text-sm text-primary bg-primary/10 rounded-xl px-3 py-2 text-center">
    {{ primaryStatusMessage }}
</div>

      <div v-if="countdownDisplay" class="flex justify-center mt-3">
        <span class="font-mono text-lg font-bold text-warning">{{ countdownDisplay }}</span>
      </div>
      <div v-else-if="countdownExpired" class="flex justify-center mt-3">
        <span class="text-sm text-error font-medium">مهلت پرداخت به اتمام رسید</span>
      </div>
    </div>
  </div>
</template>