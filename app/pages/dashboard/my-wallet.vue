<!-- app/pages/dashboard/my-wallet.vue -->
<script setup lang="ts">
import { ArrowDownToLine, ArrowUpFromLine, ShieldCheck, Sparkles, Loader2 } from 'lucide-vue-next'
import { formatPrice, rialToToman, tomanToRial } from '~/utils/price'
import { DEFAULT_PAYMENT_GATEWAY } from '~/utils/payment'
import { parsePersianInt } from '~/utils/number'
import type { ActivateWalletFormPayload } from '~/composables/useWallet'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'کیف پول | آسروتراول' })

const {
  depositData,
  loading,
  error,
  actionLoading,
  payoutInfo,
  hasPayoutInfo,
  balance,
  minDepositRial,
  fullName,
  fetchWallet,
  activateWallet,
  deposit,
  withdraw,
} = useWallet()

onMounted(() => { fetchWallet() })

const activateModalOpen = ref(false)

async function handleActivate(payload: ActivateWalletFormPayload) {
  const result = await activateWallet(payload)
  if (result.ok) {
    activateModalOpen.value = false
    useToast().success('کیف پول با موفقیت بروزرسانی شد')
    await fetchWallet()
  } else if (result.error) {
    useToast().error(result.error)
  }
}

const activeTab = ref<'deposit' | 'withdraw'>('deposit')

const depositForm = reactive<{ amount: string; gateway: string; option: number | ''; confirmed: boolean }>({
  amount: '',
  gateway: '',
  option: '',
  confirmed: false,
})

const depositTouched = ref(false)
const depositMax = 200000000

watch(() => depositData.value?.gateways, (gateways) => {
  if (!gateways || depositForm.gateway) return
  depositForm.gateway = gateways[DEFAULT_PAYMENT_GATEWAY] ? DEFAULT_PAYMENT_GATEWAY : (Object.keys(gateways)[0] ?? '')
}, { immediate: true })

const displayDepositAmount = computed({
  get() {
    if (!depositForm.amount) return ''
    return rialToToman(depositForm.amount).toLocaleString('fa-IR')
  },
  set(val) {
    const englishNumber = parsePersianInt(val)
    depositForm.amount = englishNumber ? String(tomanToRial(englishNumber)) : ''
  }
})

const displayWithdrawAmount = computed({
  get() {
    if (!withdrawForm.amount) return ''
    return rialToToman(withdrawForm.amount).toLocaleString('fa-IR')
  },
  set(val) {
    const englishNumber = parsePersianInt(val)
    withdrawForm.amount = englishNumber ? String(tomanToRial(englishNumber)) : ''
  }
})

const depositErrors = computed(() => {
  const amount = Number(depositForm.amount || 0)
  return {
    amount: !amount
      ? 'مبلغ مورد نظر را وارد کنید'
      : amount < minDepositRial.value
        ? `حداقل مبلغ افزایش موجودی ${formatPrice(minDepositRial.value)} است`
        : amount > depositMax
          ? `حداکثر مبلغ افزایش موجودی ${formatPrice(depositMax)} است`
          : '',
    gateway: !depositForm.gateway ? 'یک درگاه پرداخت انتخاب کنید' : '',
    confirmed: !depositForm.confirmed ? 'لطفا قوانین و مقررات را تایید کنید' : '',
  }
})

const depositValid = computed(() => !depositErrors.value.amount && !depositErrors.value.gateway && !depositErrors.value.confirmed)

function selectPackage(item: { amount: string; credit: string }, key: number) {
  depositForm.amount = item.amount
  depositForm.option = key
}

async function submitDeposit() {
  depositTouched.value = true
  if (!depositValid.value) return

  const result = await deposit({
    deposit_amount: depositForm.amount,
    payment_gateway: depositForm.gateway,
    confirmed: depositForm.confirmed,
    ...(depositForm.option !== '' ? { deposit_option: depositForm.option } : {}),
  })

  if (result.error) useToast().error(result.error)
}

const withdrawForm = reactive({
  amount: '',
  confirmed: false,
})

const withdrawTouched = ref(false)

const withdrawErrors = computed(() => {
  const amount = Number(withdrawForm.amount || 0)
  return {
    amount: !amount
      ? 'مبلغ مورد نظر را وارد کنید'
      : amount > balance.value
        ? 'مبلغ برداشت نمی‌تواند بیشتر از موجودی کیف پول باشد'
        : '',
    confirmed: !withdrawForm.confirmed ? 'لطفا قوانین و مقررات را تایید کنید' : '',
  }
})

const withdrawValid = computed(() => !withdrawErrors.value.amount && !withdrawErrors.value.confirmed)

async function submitWithdraw() {
  withdrawTouched.value = true
  if (!withdrawValid.value) return

  const result = await withdraw({
    amount: Number(withdrawForm.amount),
    confirmed: withdrawForm.confirmed,
    payout_method: 'user_wallet',
  })

  if (result.ok) {
    useToast().success(result.message ?? 'برداشت از کیف پول با موفقیت ثبت شد')
    withdrawForm.amount = ''
    withdrawForm.confirmed = false
    withdrawTouched.value = false
  } else if (result.error) {
    useToast().error(result.error)
  }
}
</script>

<template>
  <div class="px-4 lg:px-16 max-w-960 mx-auto py-8" dir="rtl">
    <h1 class="text-xl font-semibold mb-6">کیف پول من</h1>

    <UiLoadingState v-if="loading" label="در حال دریافت اطلاعات کیف پول..." />

    <div v-else-if="error" class="bg-base-100 rounded-3xl p-8 text-center">
      <p class="text-error text-sm mb-4">{{ error }}</p>
      <button class="btn btn-primary btn-sm rounded-xl" @click="fetchWallet">تلاش مجدد</button>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <DashboardWalletCard
          :full-name="fullName"
          :account-name="payoutInfo?.account_name || fullName"
          :balance="balance"
          :card-number="payoutInfo?.bank_cart"
          :bank-name="payoutInfo?.bank_name"
          :active="hasPayoutInfo"
        />

        <div v-if="!hasPayoutInfo" class="bg-base-100 rounded-3xl p-6 text-center">
          <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles :size="32" class="text-primary" />
          </div>
          <h2 class="font-bold text-base-content mb-2">کیف پول آسرو</h2>
          <p class="text-sm text-base-content/60 leading-relaxed mb-5">
            با کیف پول آسرو راحت می‌تونی بلیط بخری، هتل و استخر رزرو کنی و برای تور ثبت‌نام کنی. برای استفاده از خدمات، کیف پول خودتو فعال کن!
          </p>
          <button class="btn btn-primary rounded-xl w-full" @click="activateModalOpen = true">
            <Sparkles :size="18" />
            فعال کردن کیف‌پول
          </button>
        </div>

        <div v-else class="bg-base-100 rounded-3xl p-6">
          <div class="flex items-center gap-2 mb-3">
            <ShieldCheck :size="18" class="text-success" />
            <span class="text-sm font-medium">حساب بانکی متصل</span>
          </div>
          <p class="text-sm text-base-content/60">
            {{ payoutInfo?.bank_name }} · {{ payoutInfo?.account_name || fullName }}
          </p>
          <button class="btn btn-ghost btn-sm rounded-xl mt-4" @click="activateModalOpen = true">
            ویرایش اطلاعات حساب
          </button>
        </div>
      </div>

      <div class="lg:col-span-3">
        <div v-if="!hasPayoutInfo" class="bg-base-100 rounded-3xl p-8 h-full flex items-center justify-center text-center">
          <p class="text-sm text-base-content/50">
            برای افزایش موجودی و برداشت از کیف پول، ابتدا کیف پول خود را فعال کنید.
          </p>
        </div>

        <div v-else class="bg-base-100 rounded-3xl p-6 sm:p-8">
          <div role="tablist" class="tabs tabs-boxed mb-6 w-fit">
            <button
              role="tab"
              class="tab gap-1.5"
              :class="{ 'tab-active': activeTab === 'deposit' }"
              @click="activeTab = 'deposit'"
            >
              <ArrowDownToLine :size="16" />
              افزایش موجودی
            </button>
            <button
              role="tab"
              class="tab gap-1.5"
              :class="{ 'tab-active': activeTab === 'withdraw' }"
              @click="activeTab = 'withdraw'"
            >
              <ArrowUpFromLine :size="16" />
              برداشت
            </button>
          </div>

          <form v-if="activeTab === 'deposit'" @submit.prevent="submitDeposit">
            <fieldset class="fieldset gap-1.5 mb-4">
              <legend class="fieldset-legend">مبلغ افزایش موجودی</legend>
              <label class="input w-full flex items-center gap-2" dir="ltr">
                <span class="text-base-content/60 text-sm shrink-0" dir="rtl">تومان</span>
                <input v-model="displayDepositAmount" type="text" class="grow text-left text-lg font-medium" placeholder="۰" />
              </label>
              <p v-if="depositTouched && depositErrors.amount" class="text-xs text-error">{{ depositErrors.amount }}</p>
              <p v-else class="text-xs text-base-content/40">
                مبلغ وارد شده باید بین {{ formatPrice(minDepositRial) }} تا {{ formatPrice(depositMax) }} باشد.
              </p>
            </fieldset>

            <div v-if="depositData?.wallet_deposit_lists?.length" class="flex flex-wrap gap-2 mb-6">
              <button
                v-for="(item, key) in depositData.wallet_deposit_lists"
                :key="key"
                type="button"
                class="rounded-xl px-4 py-2 text-sm border transition-colors font-medium"
                :class="depositForm.amount == item.amount
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-base-300 text-base-content/60 hover:border-base-content/30'"
                @click="selectPackage(item, Number(key))"
              >
                {{ formatPrice(item.amount) }}
              </button>
            </div>

            <fieldset v-if="depositData?.gateways" class="fieldset gap-1.5 mb-6">
              <legend class="fieldset-legend">درگاه پرداخت</legend>
              <div class="flex flex-wrap gap-3">
                <label
                  v-for="(gateway, key) in depositData.gateways"
                  :key="key"
                  class="flex items-center gap-2 rounded-xl border px-4 py-2.5 cursor-pointer transition-colors"
                  :class="depositForm.gateway === key ? 'border-primary bg-primary/5' : 'border-base-300'"
                >
                  <input v-model="depositForm.gateway" type="radio" :value="key" class="radio radio-sm radio-primary" />
                  <img :src="gateway.logo" :alt="gateway.name" class="w-6 h-6 object-contain rounded" />
                  <span class="text-sm">{{ gateway.name }}</span>
                </label>
              </div>
              <p v-if="depositTouched && depositErrors.gateway" class="text-xs text-error">{{ depositErrors.gateway }}</p>
            </fieldset>

            <label class="flex items-start gap-2 mb-2 cursor-pointer">
              <input v-model="depositForm.confirmed" type="checkbox" class="checkbox checkbox-sm mt-0.5" />
              <span class="text-xs sm:text-sm text-base-content/70">
                با تایید شما با قوانین و مقررات آسروتراول موافق هستید
              </span>
            </label>
            <p v-if="depositTouched && depositErrors.confirmed" class="text-error text-xs mb-6">{{ depositErrors.confirmed }}</p>
            <div v-else class="mb-6" />

            <button type="submit" class="btn btn-primary w-full rounded-xl" :disabled="actionLoading">
              <Loader2 v-if="actionLoading" class="size-4 animate-spin" />
              <template v-else>
                <ArrowDownToLine :size="18" />
                افزایش موجودی کیف پول
              </template>
            </button>
          </form>

          <form v-else @submit.prevent="submitWithdraw">
            <fieldset class="fieldset gap-1.5 mb-4">
              <legend class="fieldset-legend">مبلغ برداشت</legend>
              <label class="input w-full flex items-center gap-2" dir="ltr">
                <span class="text-base-content/60 text-sm shrink-0" dir="rtl">تومان</span>
                <input v-model="displayWithdrawAmount" type="text" class="grow text-left text-lg font-medium" placeholder="۰" />
                <button
                  v-if="balance > 0"
                  type="button"
                  class="text-xs text-primary font-medium shrink-0"
                  @click="withdrawForm.amount = String(balance)"
                >
                  حداکثر
                </button>
              </label>
              <p v-if="withdrawTouched && withdrawErrors.amount" class="text-xs text-error">{{ withdrawErrors.amount }}</p>
              <p v-else class="text-xs text-base-content/40">
                موجودی قابل برداشت: {{ formatPrice(balance) }}
              </p>
            </fieldset>

            <p class="text-xs text-base-content/50 mb-6">
              مبلغ به حساب بانکی متصل به کیف پول ({{ payoutInfo?.bank_name }}) واریز خواهد شد.
            </p>

            <label class="flex items-start gap-2 mb-2 cursor-pointer">
              <input v-model="withdrawForm.confirmed" type="checkbox" class="checkbox checkbox-sm mt-0.5" />
              <span class="text-xs sm:text-sm text-base-content/70">
                با تایید شما با قوانین و مقررات آسروتراول موافق هستید
              </span>
            </label>
            <p v-if="withdrawTouched && withdrawErrors.confirmed" class="text-error text-xs mb-6">{{ withdrawErrors.confirmed }}</p>
            <div v-else class="mb-6" />

            <button type="submit" class="btn btn-primary w-full rounded-xl" :disabled="actionLoading">
              <Loader2 v-if="actionLoading" class="size-4 animate-spin" />
              <template v-else>
                <ArrowUpFromLine :size="18" />
                برداشت از کیف پول
              </template>
            </button>
          </form>
        </div>
      </div>
    </div>

    <DashboardWalletActivateModal
      :is-open="activateModalOpen"
      :loading="actionLoading"
      :initial="payoutInfo"
      :default-account-name="fullName"
      @close="activateModalOpen = false"
      @submit="handleActivate"
    />
  </div>
</template>