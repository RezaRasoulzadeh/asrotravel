<!-- app/components/ui/LoadingState.vue -->
<script setup lang="ts">
interface Props {
  label?: string
  size?: 'sm' | 'md' | 'lg'
  fullscreen?: boolean
}

withDefaults(defineProps<Props>(), {
  label: undefined,
  size: 'md',
  fullscreen: false,
})
</script>

<template>
  <div
    dir="rtl"
    class="flex flex-col items-center justify-center gap-4 py-16 text-center px-4"
    :class="{ 'min-h-[60vh]': fullscreen }"
  >
    <div class="relative flex items-center justify-center">
      <span
        class="absolute rounded-full bg-primary/10 animate-ping"
        :class="size === 'sm' ? 'size-10' : size === 'lg' ? 'size-20' : 'size-16'"
      />
      <span
        class="relative rounded-full bg-primary/10 flex items-center justify-center"
        :class="size === 'sm' ? 'size-10' : size === 'lg' ? 'size-20' : 'size-16'"
      >
        <span
          class="loading loading-spinner text-primary"
          :class="size === 'sm' ? 'loading-sm' : size === 'lg' ? 'loading-lg' : 'loading-md'"
        />
      </span>
    </div>

    <p v-if="label" class="text-sm text-base-content/50 animate-pulse">{{ label }}</p>
  </div>
</template>