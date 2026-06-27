// error.vue
<script setup lang="ts">
import { AlertTriangle, RefreshCw, Home, ArrowRight } from 'lucide-vue-next'
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const theme = useCookie<'light' | 'dark'>('asro_theme', {
  default: () => 'light',
  maxAge: 60 * 60 * 24 * 365,
})

useHead(() => ({
  htmlAttrs: { 'data-theme': theme.value },
}))

const handleError = () => clearError({ redirect: '/' })
const retry = () => clearError()
const goBack = () => useRouter().back()
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-center p-6 space-y-8 bg-base-200">
    <div class="relative">
      <div class="absolute inset-0 bg-error/20 blur-3xl rounded-full scale-150"></div>
      <AlertTriangle :size="80" class="text-error relative animate-pulse"/>
    </div>

    <div class="space-y-3">
      <h1 class="text-6xl lg:text-8xl font-black text-base-content">{{ error.statusCode }}</h1>
      <h2 class="text-2xl font-bold text-base-content/80">
        {{ error.statusCode === 404 ? 'صفحه مورد نظر پیدا نشد' : 'خطایی رخ داد' }}
      </h2>
      <p class="text-base-content/60 max-w-sm mx-auto">
        {{ error.message || 'مشکلی در سیستم پیش آمده است. لطفاً از دکمه‌های زیر استفاده کنید.' }}
      </p>
    </div>

    <div class="flex items-center gap-3">
      <button @click="goBack" class="btn btn-soft btn-warning gap-2 rounded-xl">
        <ArrowRight :size="16"/>
        <span class="pt-1">بازگشت</span>
      </button>

      <button v-if="error.statusCode != 404" @click="retry" class="btn btn-primary gap-2 rounded-xl px-6">
        <RefreshCw :size="16"/>
        <span class="pt-1">تلاش مجدد</span>
      </button>

      <button @click="handleError" class="btn btn-soft btn-primary gap-2 rounded-xl">
        <Home :size="16"/>
        <span class="pt-1">صفحه اصلی</span>
      </button>
    </div>
  </div>
</template>