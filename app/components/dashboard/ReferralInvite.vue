<!-- app/components/dashboard/ReferralInvite.vue -->
<script setup lang="ts">
import { Share2 } from 'lucide-vue-next'
import QRCode from 'qrcode'

const { user } = useAuth()
const { buildReferralLink } = useReferral()

const referralLink = computed(() => buildReferralLink(user.value?.Token))
const qrDataUrl = ref('')
const isShareOpen = ref(false)

watch(referralLink, async (link) => {
  if (!import.meta.client || !link) {
    qrDataUrl.value = ''
    return
  }
  qrDataUrl.value = await QRCode.toDataURL(link, { margin: 1, width: 160 })
}, { immediate: true })
</script>

<template>
  <div v-if="referralLink" class="flex flex-col items-center gap-3 text-center">
    <div>
      <p class="text-sm font-semibold">دعوت از دوستان</p>
      <p class="text-xs text-base-content/50 mt-1">با اشتراک‌گذاری لینک زیر، دوستان خود را به آسروتراول دعوت کنید</p>
    </div>

    <img
      v-if="qrDataUrl"
      :src="qrDataUrl"
      alt="کد QR لینک دعوت"
      class="size-42 rounded-xl p-2 border border-base-200"
    />

    <div class="w-full bg-base-200 rounded-xl px-2.5 py-1.5 text-[11px] text-base-content/60 truncate" dir="ltr">
      {{ referralLink }}
    </div>

    <button
      type="button"
      class="btn btn-sm btn-primary btn-soft w-full rounded-xl gap-1.5"
      @click="isShareOpen = true"
    >
      <Share2 :size="14" />
      اشتراک‌گذاری لینک دعوت
    </button>

    <UiShareModal
      :is-open="isShareOpen"
      :url="referralLink"
      title="به آسروتراول بپیوندید"
      @close="isShareOpen = false"
    />
  </div>
</template>