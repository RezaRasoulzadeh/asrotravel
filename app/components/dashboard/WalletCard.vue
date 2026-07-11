<!-- app/components/dashboard/WalletCard.vue -->
<script setup lang="ts">
import { Wallet, Sparkles, Eye, EyeOff } from 'lucide-vue-next'
import { formatPrice } from '~/utils/price'

interface Props {
  fullName: string
  accountName?: string | null
  balance: number
  cardNumber?: string | null
  bankName?: string | null
  active: boolean
}

const props = withDefaults(defineProps<Props>(), {
  accountName: null,
  cardNumber: null,
  bankName: null,
})

const displayName = computed(() => (props.active && props.accountName) ? props.accountName : props.fullName)

const revealed = ref(false)

const balanceDisplay = computed(() => {
  if (!revealed.value) return '•••••••'
  return props.balance > 0 ? formatPrice(props.balance) : '۰ تومان'
})

const cardDigits = computed(() => (props.cardNumber ?? '').replace(/\D/g, ''))

const maskedCard = computed(() => {
  if (cardDigits.value.length !== 16) return '••••   ••••   ••••   ••••'

  if (revealed.value) {
    return `${cardDigits.value.slice(0, 4)}   ${cardDigits.value.slice(4, 8)}   ${cardDigits.value.slice(8, 12)}   ${cardDigits.value.slice(12)}`
  }

  return `${cardDigits.value.slice(0, 4)}   ••••   ••••   ${cardDigits.value.slice(12)}`
})

function toggleReveal() {
  revealed.value = !revealed.value
}
</script>

<template>
  <div class="relative overflow-hidden rounded-[1.75rem] p-6 sm:p-7 text-primary-content shadow-lg wallet-card-surface">
    <div class="absolute -left-10 -top-14 w-52 h-52 rounded-full bg-white/10 pointer-events-none" />
    <div class="absolute -right-6 -bottom-16 w-40 h-40 rounded-full bg-white/10 pointer-events-none" />

    <div class="relative flex items-start justify-between">
      <div class="flex items-center gap-2">
        <span class="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
          <Wallet :size="18" />
        </span>
        <span class="text-sm font-medium text-primary-content/80">کیف پول آسرو</span>
      </div>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center backdrop-blur-sm cursor-pointer hover:bg-white/25 transition-colors"
          :aria-label="revealed ? 'پنهان کردن اطلاعات' : 'نمایش اطلاعات'"
          @click="toggleReveal"
        >
          <EyeOff v-if="revealed" :size="15" />
          <Eye v-else :size="15" />
        </button>
        <Sparkles :size="18" class="text-primary-content/50" />
      </div>
    </div>

    <div class="relative mt-8">
      <p class="text-xs text-primary-content/70 mb-1">موجودی قابل استفاده</p>
      <p class="text-2xl sm:text-3xl font-bold leading-none">{{ balanceDisplay }}</p>
    </div>

    <div class="relative mt-8 flex items-end justify-between gap-3">
      <div class="min-w-0">
        <p class="font-[monospace] text-lg sm:text-xl tracking-widest" dir="ltr">{{ maskedCard }}</p>
        <p class="text-xs text-primary-content/70 mt-2 truncate">
          {{ displayName || 'کاربر آسروتراول' }}<span v-if="active && bankName"> · بانک {{ bankName }}</span>
        </p>
      </div>
      <span
        v-if="!active"
        class="shrink-0 text-[11px] bg-white/15 rounded-lg px-2 py-1 backdrop-blur-sm"
      >
        غیرفعال
      </span>
    </div>
  </div>
</template>

<style scoped>
.wallet-card-surface {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
}
</style>