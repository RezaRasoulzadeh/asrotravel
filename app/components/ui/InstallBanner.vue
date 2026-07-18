<!-- app/components/ui/InstallBanner.vue -->
<script setup lang="ts">
import { Download, Share, SquarePlus, X } from 'lucide-vue-next'

const { canInstall, isIos, deferredPromptReady, promptInstall, dismiss, detectEnvironment, registerListener } = useAppInstall()

onMounted(() => {
  detectEnvironment()
  registerListener()
})
</script>

<template>
  <Transition name="install-banner">
    <div
      v-if="canInstall"
      class="fixed bottom-4 inset-x-4 z-90 mx-auto max-w-sm bg-base-100 border border-base-300 rounded-2xl shadow-xl p-4"
      dir="rtl"
    >
      <button
        class="btn btn-ghost btn-xs btn-square absolute top-2 left-2"
        aria-label="بستن"
        @click="dismiss"
      >
        <X :size="14" />
      </button>

      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Download :size="20" />
        </div>

        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold text-base-content">نصب آسروتراول</p>

          <p v-if="isIos" class="text-xs text-base-content/60 mt-0.5">
            برای نصب، دکمه
            <Share :size="12" class="inline align-text-bottom" />
            را بزنید و «افزودن به صفحه اصلی»
            <SquarePlus :size="12" class="inline align-text-bottom" />
            را انتخاب کنید
          </p>
          <p v-else class="text-xs text-base-content/60 mt-0.5">
            با نصب اپلیکیشن، دسترسی سریع‌تری به رزروهای خود داشته باشید
          </p>
        </div>

        <button
          v-if="deferredPromptReady"
          class="btn btn-primary btn-sm rounded-xl shrink-0"
          @click="promptInstall"
        >
          نصب
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.install-banner-enter-active,
.install-banner-leave-active {
  transition: all 0.25s ease;
}
.install-banner-enter-from,
.install-banner-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
