<!-- app/components/dashboard/WalletActivateModal.vue -->
<script setup lang="ts">
import { X, Loader2, ShieldCheck } from 'lucide-vue-next'
import type { WalletPayoutInfo } from '~/types/wallet.types'
import type { ActivateWalletFormPayload } from '~/composables/useWallet'

interface Props {
  isOpen: boolean
  loading: boolean
  initial?: WalletPayoutInfo | null
}

const props = withDefaults(defineProps<Props>(), { initial: null })
const emit = defineEmits<{ close: []; submit: [payload: ActivateWalletFormPayload] }>()

const form = reactive({
  account_name: '',
  bank_name: '',
  cardDigits: '',
  sheba_number: '',
})

watch(() => props.isOpen, (open) => {
  if (!open) return
  form.account_name = props.initial?.account_name ?? ''
  form.bank_name = props.initial?.bank_name ?? ''
  form.cardDigits = (props.initial?.bank_cart ?? '').replace(/\D/g, '')
  form.sheba_number = props.initial?.sheba_number ?? ''
  errors.account_name = ''
  errors.bank_name = ''
  errors.bank_cart = ''
  errors.sheba_number = ''
})

const cardDisplay = computed({
  get: () => form.cardDigits.replace(/(.{4})/g, '$1 ').trim(),
  set: (val: string) => { form.cardDigits = val.replace(/\D/g, '').slice(0, 16) },
})

const errors = reactive({ account_name: '', bank_name: '', bank_cart: '', sheba_number: '' })

function validate(): boolean {
  errors.account_name = form.account_name.trim().length < 3 ? 'نام دارنده حساب باید حداقل ۳ کاراکتر باشد' : ''
  errors.bank_name = form.bank_name.trim().length < 3 ? 'نام بانک را وارد کنید' : ''
  errors.bank_cart = form.cardDigits.length !== 16 ? 'شماره کارت باید ۱۶ رقم باشد' : ''
  errors.sheba_number = /^IR\d{24}$/.test(form.sheba_number.trim()) ? '' : 'شماره شبا باید با IR شروع شده و ۲۴ رقم باشد'
  return !errors.account_name && !errors.bank_name && !errors.bank_cart && !errors.sheba_number
}

function handleSubmit() {
  if (!validate()) return
  emit('submit', {
    account_name: form.account_name.trim(),
    bank_name: form.bank_name.trim(),
    bank_cart: form.cardDigits,
    sheba_number: form.sheba_number.trim().toUpperCase(),
  })
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isOpen"
          class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          @click="emit('close')"
        >
          <div class="w-full max-w-md bg-base-100 rounded-3xl p-6 border border-base-200 shadow-xl" dir="rtl" @click.stop>
            <div class="flex items-center justify-between mb-1">
              <h3 class="font-bold text-base-content">فعال‌سازی کیف پول</h3>
              <button class="p-1.5 hover:bg-base-200 rounded-lg transition-colors cursor-pointer" @click="emit('close')">
                <X class="size-4" />
              </button>
            </div>
            <p class="text-xs text-base-content/50 mb-5">
              اطلاعات حساب بانکی خود را وارد کنید تا واریز و برداشت از کیف پول فعال شود.
            </p>

            <div class="space-y-4">
              <fieldset class="fieldset gap-1.5">
                <legend class="fieldset-legend">نام دارنده حساب</legend>
                <label class="input w-full">
                  <input v-model="form.account_name" type="text" class="grow" />
                </label>
                <p v-if="errors.account_name" class="text-xs text-error">{{ errors.account_name }}</p>
              </fieldset>

              <fieldset class="fieldset gap-1.5">
                <legend class="fieldset-legend">نام بانک</legend>
                <label class="input w-full">
                  <input v-model="form.bank_name" type="text" placeholder="بانک ملی ایران" class="grow" />
                </label>
                <p v-if="errors.bank_name" class="text-xs text-error">{{ errors.bank_name }}</p>
              </fieldset>

              <fieldset class="fieldset gap-1.5">
                <legend class="fieldset-legend">شماره کارت</legend>
                <label class="input w-full" dir="ltr">
                  <input
                    v-model="cardDisplay"
                    type="text"
                    inputmode="numeric"
                    placeholder="XXXX XXXX XXXX XXXX"
                    class="grow text-left"
                  />
                </label>
                <p v-if="errors.bank_cart" class="text-xs text-error">{{ errors.bank_cart }}</p>
              </fieldset>

              <fieldset class="fieldset gap-1.5">
                <legend class="fieldset-legend">شماره شبا</legend>
                <label class="input w-full" dir="ltr">
                  <input v-model="form.sheba_number" type="text" placeholder="IRXXXXXXXXXXXXXXXXXXXXXXXX" class="grow text-left" />
                </label>
                <p v-if="errors.sheba_number" class="text-xs text-error">{{ errors.sheba_number }}</p>
              </fieldset>

              <p class="flex items-center gap-1.5 text-[11px] text-base-content/40">
                <ShieldCheck :size="14" class="shrink-0" />
                اطلاعات شما رمزنگاری شده و صرفا برای واریز و برداشت استفاده می‌شود.
              </p>
            </div>

            <div class="flex gap-2 mt-6">
              <button type="button" class="btn btn-ghost flex-1 rounded-xl" @click="emit('close')">انصراف</button>
              <button type="button" class="btn btn-primary flex-1 rounded-xl" :disabled="loading" @click="handleSubmit">
                <Loader2 v-if="loading" class="size-4 animate-spin" />
                <span v-else>تایید و ذخیره</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>