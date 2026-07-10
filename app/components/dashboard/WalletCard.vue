<!-- app/components/dashboard/WalletCard.vue -->
<script setup lang="ts">
import { Wallet, Sparkles } from 'lucide-vue-next'
import { formatPrice } from '~/utils/price'

interface Props {
  fullName: string
  balance: number
  cardNumber?: string | null
  bankName?: string | null
  active: boolean
}

const props = withDefaults(defineProps<Props>(), {
  cardNumber: null,
  bankName: null,
})

const balanceDisplay = computed(() => props.balance > 0 ? formatPrice(props.balance) : '۰ تومان')

const maskedCard = computed(() => {
  const digits = (props.cardNumber ?? '').replace(/\D/g, '')
  if (digits.length !== 16) return '••••   ••••   ••••   ••••'
  return `${digits.slice(0, 4)}   ••••   ••••   ${digits.slice(12)}`
})
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
      <Sparkles :size="18" class="text-primary-content/50" />
    </div>

    <div class="relative mt-8">
      <p class="text-xs text-primary-content/70 mb-1">موجودی قابل استفاده</p>
      <p class="text-2xl sm:text-3xl font-bold leading-none">{{ balanceDisplay }}</p>
    </div>

    <div class="relative mt-8 flex items-end justify-between gap-3">
      <div class="min-w-0">
        <p class="font-[monospace] text-lg sm:text-xl tracking-widest" dir="ltr">{{ maskedCard }}</p>
        <p class="text-xs text-primary-content/70 mt-2 truncate">
          {{ fullName || 'کاربر آسروتراول' }}<span v-if="active && bankName"> · بانک {{ bankName }}</span>
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