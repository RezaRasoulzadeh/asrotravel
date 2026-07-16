<!-- app/components/cart/CheckoutSummary.vue -->
<script setup lang="ts">
import { Landmark, Loader2 } from 'lucide-vue-next'
import type { CheckoutResponse, CouponApplyBooking } from '~/types/checkout.types'
import { formatPrice, rialToToman, tomanToRial } from '~/utils/price'
import { DEFAULT_PAYMENT_GATEWAY } from '~/utils/payment'
import { parsePersianInt } from '~/utils/number'
import CouponInput from '~/components/cart/CouponInput.vue'
import OrganizationPaymentCheck from '~/components/cart/OrganizationPaymentCheck.vue'

interface Props {
  checkout: CheckoutResponse
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  pay: [payload: { gateway: string; credit: number; howToPay: 'full' | 'deposit'; organizationPayment?: boolean }]
  couponApplied: [booking: CouponApplyBooking]
}>()

const { user } = useAuth()
const {
  balance: liveWalletBalance,
  loading: walletLoading,
  fetchWallet,
} = useWallet()

onMounted(() => { fetchWallet() })

const { primaryStatusMessage, accessToPaid, countdownDisplay, countdownExpired, statusLoading } =
  useBookingStatus(props.checkout.booking.booking_code)

const selectedGateway = ref<string | null>(
  props.checkout.gateways[DEFAULT_PAYMENT_GATEWAY]
    ? DEFAULT_PAYMENT_GATEWAY
    : (Object.keys(props.checkout.gateways)[0] ?? null)
)

const payWithWallet = ref(false)
const walletCredit = ref(0)

const { hasDeposit, payableTotal, remainingAtVenue } = useCheckoutTotals(() => props.checkout)

const userWalletBalance = computed(() =>
  walletLoading.value ? Number(user.value?.wallet?.balance ?? 0) : liveWalletBalance.value)

const neededCredit = computed(() => {
  return Math.ceil(
    userWalletBalance.value > payableTotal.value
      ? payableTotal.value
      : payableTotal.value - userWalletBalance.value
  )
})

const maxWalletCredit = computed(() => Math.max(0, Math.min(neededCredit.value, userWalletBalance.value)))

watch(payWithWallet, (enabled) => {
  walletCredit.value = enabled ? maxWalletCredit.value : 0
})

watch(maxWalletCredit, (max) => {
  if (walletCredit.value > max) walletCredit.value = max
})

const walletCreditDisplay = computed({
  get: () => walletCredit.value > 0 ? rialToToman(walletCredit.value).toLocaleString('fa-IR') : '',
  set: (val: string) => {
    const digits = parsePersianInt(val)
    const num = digits ? tomanToRial(digits) : 0
    walletCredit.value = Math.min(num, maxWalletCredit.value)
  },
})

const remainingAfterWallet = computed(() => payableTotal.value - walletCredit.value)
const needsGateway = computed(() => remainingAfterWallet.value > 0)

const payDisabled = computed(() =>
  statusLoading.value || !accessToPaid.value || (needsGateway.value && !selectedGateway.value) || props.loading
)

const isOrganizationUser = computed(() => !!user.value?.is_organization)

function onPayClick() {
  if (payWithWallet.value && userWalletBalance.value <= 0) {
    useToast().error('مجاز به پرداخت از طریق کیف پول نیستید.')
    return
  }

  emit('pay', {
    gateway: selectedGateway.value ?? '',
    credit: walletCredit.value,
    howToPay: payWithWallet.value ? 'deposit' : 'full',
  })
}

function onOrganizationConfirmed() {
  emit('pay', { gateway: '', credit: 0, howToPay: 'deposit', organizationPayment: true })
}
</script>

<template>
  <div dir="rtl" class="w-full flex flex-col gap-4">
    <div class="bg-base-100 rounded-3xl border border-base-300 p-6 shadow-sm">
      <div class="flex justify-between items-center">
        <span class="text-base-content/70">{{ hasDeposit ? 'قابل پرداخت آنلاین (بیعانه):' : 'مبلغ قابل پرداخت:' }}</span>
        <span class="font-bold text-xl text-primary">{{ formatPrice(payableTotal) }}</span>
      </div>
      <div v-if="hasDeposit" class="flex justify-between items-center mt-3 pt-3 border-t border-base-300/60 text-sm">
        <span class="text-base-content/60">باقیمانده (پرداخت در محل):</span>
        <span class="font-medium">{{ formatPrice(remainingAtVenue) }}</span>
      </div>
      <div v-if="hasDeposit" class="bg-warning/10 text-warning text-xs rounded-xl px-3 py-2 mt-3">
        فقط مبلغ بیعانه اکنون پرداخت می‌شود؛ باقیمانده هنگام حضور در مجموعه دریافت خواهد شد.
      </div>
    </div>

    <div class="bg-base-100 rounded-3xl border border-base-300 p-6 shadow-sm">
      <CouponInput :booking-code="checkout.booking.booking_code" @applied="emit('couponApplied', $event)" />
    </div>

    <div class="bg-base-100 rounded-3xl border border-base-300 p-6 shadow-sm">
      <h3 class="font-bold text-base mb-4 pb-4 border-b border-base-300">پرداخت</h3>

      <label class="flex items-center gap-3 cursor-pointer">
        <input v-model="payWithWallet" type="checkbox" class="toggle toggle-primary toggle-sm" :disabled="walletLoading || userWalletBalance <= 0">
        <span class="text-sm">پرداخت از کیف پول</span>
        <Loader2 v-if="walletLoading" class="size-3.5 animate-spin text-base-content/40" />
        <span v-else-if="userWalletBalance <= 0" class="text-xs text-base-content/40">(موجودی ندارید)</span>
      </label>

      <ul v-if="payWithWallet" class="mt-4 space-y-2 text-sm">
        <li class="flex justify-between">
          <span class="text-base-content/70">اعتبار کیف پول شما:</span>
          <span class="text-primary font-medium">{{ formatPrice(userWalletBalance) }}</span>
        </li>
        <li class="flex justify-between items-center">
          <span class="text-base-content/70">اعتبار مورد نیاز:</span>
          <span class="cursor-pointer text-base-content/80" @click="walletCredit = maxWalletCredit">
            {{ formatPrice(maxWalletCredit) }}
          </span>
        </li>
        <li class="flex justify-between items-center gap-3">
          <span class="text-base-content/70 shrink-0">مبلغ پرداخت از کیف پول:</span>
          <label class="input input-bordered input-sm w-40" dir="ltr">
            <input
              v-model="walletCreditDisplay"
              type="text"
              inputmode="numeric"
              placeholder="0"
              class="grow text-left"
            >
            <span class="text-xs text-base-content/50 shrink-0">تومان</span>
          </label>
        </li>
      </ul>

      <div v-if="needsGateway" class="mt-4">
        <OrganizationPaymentCheck
          v-if="isOrganizationUser"
          :booking-code="checkout.booking.booking_code"
          :payable-total="remainingAfterWallet"
          @confirmed="onOrganizationConfirmed"
        />
        <div class="bg-success/10 text-success text-xs rounded-xl px-3 py-2 mb-3">
          پرداخت با تمام کارت‌های بانکی عضو شبکه شتاب.
        </div>
        <div class="flex gap-3 flex-wrap">
          <label
            v-for="(gateway, key) in checkout.gateways"
            :key="key"
            class="flex flex-col items-center justify-center gap-1 border rounded-xl w-24 h-24 cursor-pointer transition-colors p-1"
            :class="selectedGateway === key ? 'border-primary border-2 text-primary shadow-sm shadow-primary/30' : 'border-base-300'"
          >
            <input v-model="selectedGateway" type="radio" :value="key" class="hidden">
            <img
              v-if="gateway.logo"
              :src="gateway.logo"
              :alt="gateway.name"
              class="rounded-lg h-full bg-white object-contain"
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
        <Loader2 v-if="loading || statusLoading" class="animate-spin ml-2 h-5 w-5" />
        {{ statusLoading ? 'در حال بررسی وضعیت رزرو...' : (loading ? 'در حال پردازش...' : 'پرداخت و دریافت رسید') }}
      </button>

      <div v-if="loading" class="mt-3 flex items-center justify-center gap-2 text-sm text-base-content/70">
        <Loader2 class="w-4 h-4 animate-spin text-primary" />
        <span>در حال انتقال به درگاه پرداخت، لطفاً منتظر بمانید...</span>
      </div>

      <div v-if="primaryStatusMessage" class="mt-4 text-sm text-primary bg-primary/10 rounded-xl px-3 py-2 text-center">
        {{ primaryStatusMessage }}
      </div>

      <div v-if="countdownDisplay && !statusLoading" class="flex justify-center mt-3">
        <span class="font-mono text-lg font-bold text-warning">{{ countdownDisplay }}</span>
      </div>
      <div v-else-if="countdownExpired && !statusLoading" class="flex justify-center mt-3">
        <span class="text-sm text-error font-medium">مهلت پرداخت به اتمام رسید</span>
      </div>
    </div>
  </div>
</template>