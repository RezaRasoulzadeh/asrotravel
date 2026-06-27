// components/pool/PoolPolicySection.vue
<script setup lang="ts">
import type { Component } from 'vue'
import BlogRenderer from '../blog/BlogRenderer.vue'

interface Props {
  title: string
  subtitle?: string | null
  icon?: string | Component | null
  blocks?: any[]
}

withDefaults(defineProps<Props>(), {
  subtitle: '',
  icon: 'FileText',
  blocks: () => [],
})
</script>

<template>
  <section class="py-4 lg:py-8 flex flex-col">
    <!-- Header -->
    <div class="max-w-960 w-full mx-auto flex flex-col">
      <div class="flex flex-row gap-3 mb-2">
        <div class="p-2 rounded-xl bg-primary/10 text-primary w-fit aspect-square">
          <component :is="icon" :size="22" />
        </div>
              <h1 class="text-3xl font-bold text-base-content">{{ title }}</h1>
      </div>
      <p v-if="subtitle" class="text-base-content/60 mt-2 text-sm leading-relaxed max-w-prose">
        {{ subtitle }}
      </p>
    </div>

    <!-- Content -->
    <div class="max-w-960 w-full mx-auto mt-4">
      <div class="bg-base-100 rounded-3xl border border-base-300 p-2 lg:p-6 mx-auto">
        <BlogRenderer :blocks="blocks" />
      </div>
    </div>
  </section>
</template>