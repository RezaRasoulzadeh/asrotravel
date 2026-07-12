<!-- app/pages/dashboard/support/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'پشتیبانی | آسروتراول' })
</script>

<template>
  <div class="px-4 lg:px-16 max-w-960 mx-auto py-8">
    <h1 class="text-xl font-semibold mb-6">پشتیبانی</h1>

    <div class="grid grid-cols-1 lg:grid-cols-7 gap-6 items-start">
      <div class="lg:col-span-5">
        <DashboardSupportTicketsList />
      </div>
      <div class="hidden lg:block lg:col-span-2">
        <DashboardSupportFaqSidebar />
      </div>
    </div>
  </div>
</template>
