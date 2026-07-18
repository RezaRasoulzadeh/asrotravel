<!-- app/pages/dashboard/support/index.vue -->
<script setup lang="ts">
definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'پشتیبانی | آسروتراول' })
</script>

<template>
  <div class="px-4 lg:px-6 max-w-960 mx-auto py-4 lg:py-6">
    <div class="grid grid-cols-1 lg:grid-cols-7 gap-6 items-start">
      <div class="lg:col-span-5 order-1 min-w-0">
        <DashboardSupportTicketsList />
      </div>
      <div class="lg:col-span-2 order-2 min-w-0">
        <DashboardSupportFaqSidebar />
      </div>
    </div>
  </div>
</template>
