<!-- app/pages/dashboard/support.vue -->
<script setup lang="ts">
import { HeadphonesIcon } from 'lucide-vue-next'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'پشتیبانی | آسروتراول' })
</script>

<template>
  <div class="px-4 lg:px-16 max-w-960 mx-auto py-8">
    <h1 class="text-xl font-semibold mb-6">پشتیبانی</h1>

    <div class="card bg-base-100 shadow-sm">
      <div class="card-body items-center text-center py-16 gap-3">
        <span class="bg-base-200 rounded-full p-4 text-base-content/30">
          <HeadphonesIcon :size="28" />
        </span>
        <p class="text-base-content/50 text-sm">این بخش به‌زودی فعال می‌شود</p>
      </div>
    </div>
  </div>
</template>