// components/hotel/HotelPolicySection.vue
<script setup lang="ts">
import type { Component } from 'vue'
import type { HotelPolicy } from '~/types/hotelSingle.types'
import { ChevronDown } from 'lucide-vue-next'

withDefaults(defineProps<{
  title: string
  subtitle?: string
  icon?: string | Component
  policies: HotelPolicy[]
}>(), {
  subtitle: '',
  icon: 'ScrollText',
})

const openIndex = ref<number | null>(null)

function toggle(i: number) {
  openIndex.value = openIndex.value === i ? null : i
}
</script>

<template>
  <section class="py-4 lg:py-8 flex flex-col">
    <div class="max-w-960 w-full mx-auto flex flex-col">
      <div class="flex flex-row gap-3 mb-2">
        <div class="p-2 rounded-xl bg-primary/10 text-primary w-fit aspect-square">
          <component :is="icon" :size="22" />
        </div>
        <h2 class="text-3xl font-bold text-base-content">{{ title }}</h2>
      </div>
      <p v-if="subtitle" class="text-base-content/60 mt-2 text-sm leading-relaxed max-w-prose">
        {{ subtitle }}
      </p>
    </div>

    <div class="max-w-960 w-full mx-auto mt-4 bg-base-100 rounded-3xl border border-base-300 overflow-hidden">
      <div v-for="(policy, index) in policies" :key="index"
        class="border-b border-base-200 last:border-b-0">
        <button
          class="w-full flex items-center justify-between px-5 py-4 text-right hover:bg-base-200/50 transition-colors cursor-pointer gap-4"
          @click="toggle(index)">
          <span class="font-semibold text-sm text-base-content">{{ policy.title }}</span>
          <ChevronDown
            class="size-4 text-base-content/50 shrink-0 transition-transform duration-200"
            :class="openIndex === index ? 'rotate-180' : ''" />
        </button>

        <div
          class="grid transition-all duration-200 ease-in-out"
          :class="openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
          <div class="overflow-hidden">
            <p class="px-5 pb-4 text-sm text-base-content/70 leading-7 text-right">
              {{ policy.content }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>