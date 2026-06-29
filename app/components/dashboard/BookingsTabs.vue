<!-- app/components/dashboard/BookingsTabs.vue -->
<script setup lang="ts">
import type { BookingTab } from '~/types/dashboardBookings.types'

defineProps<{ modelValue: BookingTab }>()
const emit = defineEmits<{ 'update:modelValue': [BookingTab] }>()

const tabs: { value: BookingTab, label: string, disabled?: boolean }[] = [
  { value: 'pool', label: 'استخر' },
  { value: 'hotel', label: 'هتل', disabled: true },
  { value: 'ticket', label: 'بلیط' },
]
</script>

<template>
  <div role="tablist" class="tabs tabs-boxed w-full sm:w-fit">
    <button
      v-for="item in tabs"
      :key="item.value"
      role="tab"
      type="button"
      class="tab"
      :class="{ 'tab-active': modelValue === item.value, 'opacity-40 cursor-not-allowed': item.disabled }"
      :disabled="item.disabled"
      @click="!item.disabled && emit('update:modelValue', item.value)"
    >
      {{ item.label }}
    </button>
  </div>
</template>