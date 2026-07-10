<!-- app/components/ui/Avatar.vue -->
<script setup lang="ts">
interface Props {
  src?: string | null
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  name: '',
  size: 'md',
})

const sizeClass: Record<NonNullable<Props['size']>, string> = {
  sm: 'w-8',
  md: 'w-10',
  lg: 'w-12',
  xl: 'w-20',
}

const initial = computed(() => props.name?.trim()?.charAt(0) || '؟')
</script>

<template>
  <div class="avatar placeholder">
    <div
      class="flex justify-center items-center bg-primary text-primary-content text-center rounded-full font-bold"
      :class="sizeClass[size]"
    >
      <img v-if="src" :src="src" :alt="name" loading="lazy" class="rounded-full" />
      <span v-else class="pt-0.5">{{ initial }}</span>
    </div>
  </div>
</template>