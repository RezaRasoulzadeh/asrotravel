<!-- app/components/ui/ToastContainer.vue -->
<script setup lang="ts">
import { CheckCircle2, XCircle, Info, X } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { ToastType } from '~/composables/useToast'

const { toasts, dismiss } = useToast()

const iconMap: Record<ToastType, Component> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const colorMap: Record<ToastType, string> = {
  success: 'text-success bg-success/10',
  error: 'text-error bg-error/10',
  info: 'text-primary bg-primary/10',
}
</script>

<template>
  <div class="fixed top-4 inset-x-0 z-100 flex flex-col items-center gap-2 px-4 pointer-events-none">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-center gap-3 bg-base-300 rounded-2xl px-4 py-3 max-w-sm w-full"
      >
        <div :class="[colorMap[toast.type], 'w-8 h-8 rounded-xl flex items-center justify-center shrink-0']">
          <component :is="iconMap[toast.type]" :size="16" />
        </div>
        <p class="text-sm flex-1">{{ toast.message }}</p>
        <button class="btn btn-ghost btn-xs btn-square shrink-0" aria-label="بستن" @click="dismiss(toast.id)">
          <X :size="14" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>