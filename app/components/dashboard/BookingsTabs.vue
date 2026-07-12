<!-- app/components/dashboard/BookingsTabs.vue -->
<script setup lang="ts">
import { Waves, Building2, Ticket } from 'lucide-vue-next'
import type { BookingTab } from '~/types/dashboardBookings.types'
import type { SegmentedTabItem } from '~/components/ui/SegmentedTabs.vue'

defineProps<{ modelValue: BookingTab }>()
const emit = defineEmits<{ 'update:modelValue': [BookingTab] }>()

const tabs: SegmentedTabItem<BookingTab>[] = [
  { value: 'pool', label: 'استخر', icon: Waves },
  { value: 'hotel', label: 'هتل', icon: Building2 },
  { value: 'ticket', label: 'بلیط', icon: Ticket },
]
</script>

<template>
  <UiSegmentedTabs
    :model-value="modelValue"
    :items="tabs"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>