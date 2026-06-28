// components/place/CategoryGrid.vue
<script setup lang="ts">
import type { ProvinceCategory } from '~/types/province.types'

const props = defineProps<{ categories: ProvinceCategory[] }>()

const uniqueCategories = computed(() => {
  const seen = new Set<number>()
  return props.categories.filter((c) => {
    if (!c?.slug || seen.has(c.id)) return false
    seen.add(c.id)
    return true
  })
})
</script>

<template>
  <div
    v-if="uniqueCategories.length"
    id="hero-category-scroll"
    class="w-full flex gap-2 overflow-x-auto pb-2 pt-1 px-4 lg:px-1 scrollbar-hide scroll-smooth"
  >
    <NuxtLink
      v-for="cat in uniqueCategories"
      :key="cat.id"
      :to="cat.url ?? '/'"
      class="btn btn-sm btn-soft btn-primary shrink-0 whitespace-nowrap rounded-xl"
    >
      {{ cat.translate?.title ?? '' }}
    </NuxtLink>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>