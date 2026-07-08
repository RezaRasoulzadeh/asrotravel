<!-- app/components/cart/CouponInput.vue -->
<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
import type { CouponApplyBooking } from '~/types/checkout.types'

interface Props {
  bookingCode: string
  alreadyApplied?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  alreadyApplied: false,
})

const emit = defineEmits<{ applied: [booking: CouponApplyBooking] }>()

const { applying, applyCoupon } = useCoupon()

const showInput = ref(false)
const couponCode = ref('')
const applied = ref(props.alreadyApplied)

async function onSubmit() {
  const code = couponCode.value.trim()
  if (!code || applying.value) return

  const result = await applyCoupon(props.bookingCode, code)

  if (result.data?.statue === 1) {
    useToast().success(result.data.message || 'کد تخفیف با موفقیت اعمال شد')
    applied.value = true
    emit('applied', result.data.booking)
  }
}
</script>

<template>
  <div dir="rtl">
    <label class="flex items-center justify-between cursor-pointer">
      <span class="text-sm text-base-content/70">کد تخفیف دارید؟</span>
      <input
        v-model="showInput"
        type="checkbox"
        class="toggle toggle-primary toggle-sm"
        :disabled="applied"
      >
    </label>

    <div v-if="applied" class="text-sm text-success mt-3">کد تخفیف اعمال شد</div>

    <form v-else-if="showInput" class="flex items-center gap-2 mt-3" @submit.prevent="onSubmit">
      <input
        v-model="couponCode"
        type="text"
        placeholder="کد تخفیف را وارد کنید"
        class="input input-bordered input-sm flex-1"
        :disabled="applying"
      >
      <button
        type="submit"
        class="btn btn-sm btn-primary"
        :disabled="applying || !couponCode.trim()"
      >
        <Loader2 v-if="applying" class="animate-spin size-4" />
        <span v-else>اعمال</span>
      </button>
    </form>
  </div>
</template>