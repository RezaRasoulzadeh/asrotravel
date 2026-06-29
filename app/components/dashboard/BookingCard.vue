<!-- app/components/dashboard/BookingCard.vue -->
<script setup lang="ts">
import { Calendar, MapPin, RotateCcw, Star, Users, X } from 'lucide-vue-next'
import type { DashboardBooking } from '~/types/dashboardBookings.types'

const props = defineProps<{ booking: DashboardBooking }>()
const emit = defineEmits<{ cancel: [number] }>()

const cancelling = ref(false)
const canCancel = computed(() => isBookingCancellable(props.booking.status))

const formattedDate = computed(() => {
  try {
    const date = new Date(props.booking.start_date)
    const { jy, jm, jd } = toJalaliDash(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
    // TODO: ad-hoc formatting below — replace with useJalaliDates' formatter if one
    // already exists, per the open "likely duplicates jalali.ts" question.
    return `${jd.toLocaleString('fa-IR')}/${jm.toLocaleString('fa-IR')}/${jy.toLocaleString('fa-IR')}`
  }
  catch {
    return ''
  }
})
const singleUrl = computed(() => `/${props.booking.object_model.toLowerCase()}/${props.booking.service?.slug ?? ''}`)

async function handleCancel() {
  if (!confirm('در صورت لغو، مطابق قوانین کسر هزینه اعمال می‌شود. ادامه می‌دهید؟')) return
  cancelling.value = true
  emit('cancel', props.booking.id)
  cancelling.value = false
}
</script>

<template>
  <div class="collapse collapse-arrow bg-base-100 border border-base-300 rounded-2xl">
    <input type="checkbox" class="peer">
    <div class="collapse-title flex items-center gap-3">
      <div class="flex-1 grid gap-1">
        <div class="flex items-center justify-between gap-2">
          <span class="font-medium truncate">{{ booking.service?.title ?? '—' }}</span>
          <span class="text-primary text-sm whitespace-nowrap">{{ booking.total_display }}</span>
        </div>
        <div class="flex items-center gap-3 text-xs text-base-content/60">
          <span class="flex items-center gap-1"><Users :size="14" />{{ booking.total_guests.toLocaleString('fa-IR') }} نفر</span>
          <span class="flex items-center gap-1"><MapPin :size="14" />{{ booking.service?.location?.name ?? '—' }}</span>
          <span class="flex items-center gap-1"><Calendar :size="14" />{{ formattedDate }}</span>
          <span class="badge badge-sm badge-ghost">{{ booking.status_text }}</span>
        </div>
      </div>
    </div>

    <div class="collapse-content">
      <div class="divider my-1" />
      <ul class="text-sm text-base-content/70 grid gap-1 mb-3">
        <li>کد رزرو: <span class="font-mono">{{ booking.code }}</span></li>
        <li>مبلغ پرداخت‌شده: {{ booking.paid ?? '—' }}</li>
      </ul>
      <div class="flex flex-wrap gap-2">
        <NuxtLink :to="singleUrl" class="btn btn-sm btn-soft btn-primary gap-1">
          <RotateCcw :size="16" />رزرو مجدد
        </NuxtLink>
        <NuxtLink :to="`${singleUrl}#comment`" class="btn btn-sm btn-soft gap-1">
          <Star :size="16" />ثبت نظر
        </NuxtLink>
        <button v-if="canCancel" type="button" class="btn btn-sm btn-soft btn-error gap-1" :disabled="cancelling" @click="handleCancel">
          <X :size="16" />لغو رزرو
        </button>
      </div>
    </div>
  </div>
</template>