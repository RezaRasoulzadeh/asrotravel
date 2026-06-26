<!-- components/ui/FAQ.vue -->
<script setup lang="ts">
import { BadgeQuestionMarkIcon, ChevronDown } from 'lucide-vue-next'
import { parseBlogHtml } from '~/utils/blog/parser';

interface Faq {
  title: string
  content: string
}

const props = defineProps<{
  items: Faq[]
  title?: string
  loading?: boolean
}>()

const activeIndex = ref<number | null>(null)

function toggle(index: number) {
  activeIndex.value = activeIndex.value === index ? null : index
}

const parsedItems = computed(() =>
  props.items.map(item => ({
    ...item,
    blocks: item.content ? parseBlogHtml(item.content) : []
  }))
)
</script>

<template>
  <section v-if="loading || items.length" class="faq-section px-4 lg:px-16 my-16">
    <div class="max-w-960 mx-auto">
      <div class="flex flex-row items-center gap-3 mb-8">
        <div class="p-2 rounded-xl bg-primary/10 text-primary w-fit aspect-square">
          <BadgeQuestionMarkIcon :size="22" />
        </div>
        <h1 class="text-3xl font-bold text-base-content">{{ title || 'سوالات متداول' }}</h1>
    </div>
      <div v-if="loading" class="space-y-4">
        <div v-for="i in 3" :key="i" class="h-16 bg-base-200 animate-pulse rounded-2xl" />
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="(item, index) in parsedItems"
          :key="index"
          class="bg-base-100 rounded-2xl border border-base-200 overflow-hidden transition-all duration-200"
        >
          <button
            class="w-full flex items-center justify-between p-5 text-right font-medium gap-4 hover:bg-base-200/40 transition-colors"
            @click="toggle(index)"
          >
            <span class="text-base-content/90 text-sm md:text-base">{{ item.title }}</span>
            <ChevronDown
              class="size-5 shrink-0 text-base-content/50 transition-transform duration-300"
              :class="{ 'rotate-180 text-primary': activeIndex === index }"
            />
          </button>

          <div
            class="grid transition-all duration-300 ease-in-out"
            :style="{ gridTemplateRows: activeIndex === index ? '1fr' : '0fr' }"
          >
            <div class="overflow-hidden">
              <div class="p-5 pt-0 text-sm md:text-base text-base-content/70 leading-relaxed border-t border-base-200/50 bg-base-50/30">
                <BlogRenderer :blocks="item.blocks" />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>