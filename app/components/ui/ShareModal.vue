// components/ui/ShareModal.vue
<script setup lang="ts">
import { X, Link2, Check, MessageCircle, Send, Camera } from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  title?: string
  url?: string
}>()

const emit = defineEmits(['close'])

const shareUrl = computed(() => {
  if (props.url) return props.url
  if (import.meta.client) return window.location.href
  return ''
})

const shareTitle = computed(() => props.title ?? '')

const copied = ref(false)

async function copyLink() {
  if (!shareUrl.value) return
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    copied.value = true
    useToast().success('لینک کپی شد')
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    useToast().error('کپی لینک با خطا مواجه شد')
  }
}

interface ShareChannel {
  key: string
  label: string
  href: string
  className: string
  icon: typeof MessageCircle | null
  isInstagram: boolean
}

const channels = computed<ShareChannel[]>(() => {
  const encodedUrl = encodeURIComponent(shareUrl.value)
  const encodedTitle = encodeURIComponent(shareTitle.value)

  return [
    {
      key: 'whatsapp',
      label: 'واتساپ',
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      className: 'bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20',
      icon: MessageCircle,
      isInstagram: false,
    },
    {
      key: 'telegram',
      label: 'تلگرام',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      className: 'bg-[#26A5E4]/10 text-[#26A5E4] hover:bg-[#26A5E4]/20',
      icon: Send,
      isInstagram: false,
    },
    {
      key: 'x',
      label: 'ایکس',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      className: 'bg-base-content/10 text-base-content hover:bg-base-content/20',
      icon: null,
      isInstagram: false,
    },
    {
      key: 'instagram',
      label: 'اینستاگرام',
      href: `https://www.instagram.com/`,
      className: 'bg-[#E1306C]/10 text-[#E1306C] hover:bg-[#E1306C]/20',
      icon: Camera,
      isInstagram: true,
    },
  ]
})

function onInstagramClick(e: Event) {

  e.preventDefault()
  copyLink()
  if (import.meta.client) window.open('https://www.instagram.com/', '_blank')
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', handleKeyDown))
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="isOpen"
          class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          @click="emit('close')"
        >
          <div
            class="w-full max-w-sm bg-base-100 rounded-3xl p-6 border border-base-200 shadow-xl"
            @click.stop
          >
            <div class="flex items-center justify-between mb-5">
              <h3 class="font-bold text-base-content">اشتراک‌گذاری</h3>
              <button
                @click="emit('close')"
                class="p-1.5 hover:bg-base-200 rounded-lg transition-colors cursor-pointer"
              >
                <X class="size-4" />
              </button>
            </div>

            <div class="grid grid-cols-4 gap-3 mb-5">
              <a
                v-for="channel in channels"
                :key="channel.key"
                :href="channel.href"
                target="_blank"
                rel="noopener noreferrer"
                @click="channel.isInstagram ? onInstagramClick($event) : null"
                class="flex flex-col items-center gap-1.5 group cursor-pointer"
              >
                <span
                  class="size-12 rounded-2xl flex items-center justify-center transition-colors"
                  :class="channel.className"
                >
                  <component :is="channel.icon" v-if="channel.icon" class="size-5" />
                  <span v-else class="font-bold text-lg leading-none">X</span>
                </span>
                <span class="text-[11px] text-base-content/60 group-hover:text-base-content transition-colors">
                  {{ channel.label }}
                </span>
              </a>
            </div>

            <div class="flex items-center gap-2 bg-base-200 rounded-xl p-1.5">
              <div class="flex-1 min-w-0 px-2.5 py-1.5 text-xs text-base-content/60 truncate dir-ltr text-left">
                {{ shareUrl }}
              </div>
              <button
                @click="copyLink"
                class="btn btn-sm btn-primary rounded-lg gap-1.5 shrink-0 cursor-pointer"
              >
                <component :is="copied ? Check : Link2" class="size-3.5" />
                {{ copied ? 'کپی شد' : 'کپی لینک' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.dir-ltr { direction: ltr; }
</style>