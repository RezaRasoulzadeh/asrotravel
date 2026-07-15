<!-- app/components/cart/OrganizationPaymentCheck.vue -->
<script setup lang="ts">
import { Building2 } from 'lucide-vue-next'

interface Props {
  bookingCode: string
  payableTotal: number
}

const props = defineProps<Props>()
const emit = defineEmits<{ confirmed: [] }>()

const { checking, result, check } = useOrganizationCheck(() => props.bookingCode)
const showConfirm = ref(false)

onMounted(check)

const insufficientBalance = computed(() =>
  !!result.value?.access_to_organization
  && props.payableTotal > (result.value.user_organization_balance ?? 0)
)

const confirmMessage = computed(() => insufficientBalance.value
  ? 'مبلغ فاکتور خرید شما از اعتبار سازمانی باقی‌مانده بیشتر است. می‌توانید باقیمانده مبلغ را از روش پرداخت بانکی پرداخت نمایید و یا فاکتور جدیدی ایجاد کنید.'
  : 'آیا تمایل به پرداخت این فاکتور از اعتبار سازمانی خود دارید؟')

function handleConfirm() {
  showConfirm.value = false
  emit('confirmed')
}
</script>

<template>
  <div v-if="result?.access_to_organization" class="flex items-center gap-3 bg-info/10 rounded-xl px-3 py-2 mb-3">
    <p v-if="result.message" class="text-xs text-info flex-1">{{ result.message }}</p>
    <button
      type="button"
      class="border rounded-xl w-14 h-14 shrink-0 grid place-items-center border-base-300 hover:border-primary transition-colors cursor-pointer overflow-hidden bg-base-100"
      @click="showConfirm = true"
    >
      <img
        v-if="result.avatar_url?.image_url"
        :src="result.avatar_url.image_url"
        :alt="result.title"
        class="w-full h-full object-cover"
      >
      <Building2 v-else class="size-6 text-base-content/50" />
    </button>

    <ClientOnly>
      <Teleport to="body">
        <Transition name="fade">
          <div
            v-if="showConfirm"
            class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            @click="showConfirm = false"
          >
            <div class="w-full max-w-sm bg-base-100 rounded-3xl p-6 border border-base-200 shadow-xl text-center" dir="rtl" @click.stop>
              <p class="text-sm text-base-content/80 mb-6">{{ confirmMessage }}</p>
              <div class="flex gap-2">
                <button type="button" class="btn btn-ghost flex-1 rounded-xl" @click="showConfirm = false">انصراف</button>
                <button
                  v-if="!insufficientBalance"
                  type="button"
                  class="btn btn-primary flex-1 rounded-xl"
                  @click="handleConfirm"
                >
                  تایید و پرداخت
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
  <p v-else-if="!checking && result?.message" class="text-xs text-warning mb-3">{{ result.message }}</p>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>