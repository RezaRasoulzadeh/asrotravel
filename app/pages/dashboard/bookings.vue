<!-- app/pages/dashboard/bookings.vue -->
<script setup lang="ts">

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'رزروهای من' })
</script>

<template>
  <div class="px-4 lg:px-6 max-w-960 mx-auto py-4 lg:py-6">
    <DashboardBookingsList /> 
  </div>
</template>