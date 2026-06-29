<!-- app/pages/dashboard/bookings.vue -->
<script setup lang="ts">

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'رزروهای من' })
</script>

<template>
  <div class="px-4 lg:px-16 max-w-960 mx-auto py-8">
    <h1 class="text-xl font-semibold mb-6">رزروهای من</h1>
    <DashboardBookingsList /> 
  </div>
</template>