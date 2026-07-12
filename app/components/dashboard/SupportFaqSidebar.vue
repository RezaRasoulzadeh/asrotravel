<!-- app/components/dashboard/SupportFaqSidebar.vue -->
<script setup lang="ts">
import { BadgeQuestionMarkIcon, ChevronDown, Search } from 'lucide-vue-next'
import { parseBlogHtml } from '~/utils/blog/parser'

const { faqs, loading } = useFaq(1)

const search = ref('')
const activeIndex = ref<number | null>(null)

function toggle(index: number) {
  activeIndex.value = activeIndex.value === index ? null : index
}

const filteredFaqs = computed(() => {
  const q = search.value.trim()
  if (!q) return faqs.value
  return faqs.value.filter(item => item.title.includes(q))
})

const parsedFaqs = computed(() =>
  filteredFaqs.value.map(item => ({
    ...item,
    blocks: item.content ? parseBlogHtml(item.content) : [],
  })),
)
</script>

<template>
  <div class="lg:sticky lg:top-8">
    <div class="flex justify-center mb-4">
      <div class="bg-primary/10 rounded-full p-5">
        <BadgeQuestionMarkIcon :size="28" class="text-primary" />
      </div>
    </div>

    <h2 class="text-lg font-semibold text-base-content mb-2 text-center">سوالات متداول</h2>
    <p class="text-sm text-base-content/50 text-center mb-4 leading-relaxed">
      مشکل خود را در این بخش جست‌وجو نمایید و در صورت نیاز از گزینه ثبت تیکت استفاده نمایید.
    </p>

    <label class="input w-full mb-4">
      <Search :size="16" class="text-base-content/40" />
      <input v-model="search" type="text" class="grow" placeholder="جستجو در سوالات متداول..." />
    </label>

    <div v-if="loading" class="space-y-2">
      <div v-for="i in 4" :key="i" class="h-12 bg-base-200 animate-pulse rounded-xl" />
    </div>

    <div v-else-if="!parsedFaqs.length" class="text-center text-sm text-base-content/40 py-8">
      {{ search ? 'نتیجه‌ای یافت نشد' : 'سوالی ثبت نشده است' }}
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="(item, index) in parsedFaqs"
        :key="index"
        class="bg-base-100 rounded-xl border border-base-200 overflow-hidden"
      >
        <button
          type="button"
          class="w-full flex items-center gap-2 p-3 text-right hover:bg-base-200/40 transition-colors"
          @click="toggle(index)"
        >
          <span class="w-8 h-8 shrink-0 rounded-lg bg-base-200 flex items-center justify-center">
            <BadgeQuestionMarkIcon :size="16" class="text-primary" />
          </span>
          <span class="flex-1 text-sm font-medium">{{ item.title }}</span>
          <ChevronDown
            :size="16"
            class="shrink-0 text-base-content/40 transition-transform duration-300"
            :class="{ 'rotate-180 text-primary': activeIndex === index }"
          />
        </button>

        <div class="grid transition-all duration-300 ease-in-out" :style="{ gridTemplateRows: activeIndex === index ? '1fr' : '0fr' }">
          <div class="overflow-hidden">
            <div class="px-3 pb-3 text-xs text-base-content/60 leading-relaxed border-t border-base-200/60 pt-2">
              <BlogRenderer :blocks="item.blocks" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
