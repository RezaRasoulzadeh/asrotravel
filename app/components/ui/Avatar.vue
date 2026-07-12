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
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-20 h-20',
}

const initial = computed(() => props.name?.trim()?.charAt(0) || '؟')
</script>

<template>
  <div class="avatar placeholder shrink-0">
    <div
      class="flex justify-center items-center bg-primary text-primary-content text-center rounded-full font-bold aspect-square shrink-0 overflow-hidden"
      :class="sizeClass[size]"
    >
      <img v-if="src" :src="src" :alt="name" loading="lazy" class="w-full h-full rounded-full object-cover" />
      <span v-else class="pt-0.5">{{ initial }}</span>
    </div>
  </div>
</template>