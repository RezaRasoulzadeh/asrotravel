<!-- app/components/ui/SegmentedTabs.vue -->
<script setup lang="ts" generic="T extends string">
import type { Component } from 'vue'

export interface SegmentedTabItem<T> {
  value: T
  label: string
  icon?: Component
  disabled?: boolean
  badge?: number | string
}

defineProps<{
  modelValue: T
  items: SegmentedTabItem<T>[]
}>()
const emit = defineEmits<{ 'update:modelValue': [T] }>()
</script>

<template>
  <div
    role="tablist"
    class="inline-flex items-center gap-1 p-1 bg-base-200 rounded-2xl w-full sm:w-fit overflow-x-auto no-scrollbar"
  >
    <button
      v-for="item in items"
      :key="item.value"
      role="tab"
      type="button"
      :aria-selected="modelValue === item.value"
      class="relative flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer"
      :class="modelValue === item.value
        ? 'bg-primary text-primary-content shadow-sm'
        : item.disabled
          ? 'text-base-content/30 cursor-not-allowed'
          : 'text-base-content/60 hover:text-base-content hover:bg-base-300/60'"
      :disabled="item.disabled"
      @click="!item.disabled && emit('update:modelValue', item.value)"
    >
      <component :is="item.icon" v-if="item.icon" :size="15" class="shrink-0" />
      {{ item.label }}
      <span
        v-if="item.badge"
        class="text-[10px] font-semibold leading-none rounded-full px-1.5 py-1 min-w-[1.1rem] text-center"
        :class="modelValue === item.value
          ? 'bg-primary-content/20 text-primary-content'
          : 'bg-primary/10 text-primary'"
      >
        {{ item.badge }}
      </span>
    </button>
  </div>
</template>