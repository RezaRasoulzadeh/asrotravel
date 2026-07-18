<!-- app/app.vue -->
<template>
  <NuxtLayout>
    <NuxtPage />
    <UiToastContainer />
    <UiInstallBanner />
  </NuxtLayout>
</template>

<script setup lang="ts">
const theme = useCookie<'light' | 'dark'>('asro_theme', {
  default: () => 'light',
  maxAge: 60 * 60 * 24 * 365,
})

useHead(() => ({
  htmlAttrs: { 'data-theme': theme.value },
}))

const { captureReferral } = useReferral()
onMounted(() => {
  window.scrollTo(0, 0)
  captureReferral()
})
</script>