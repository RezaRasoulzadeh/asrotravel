<!-- app/pages/dashboard/support/[id].vue -->
<script setup lang="ts">
import { ChevronRight, Loader2, Paperclip, Send, WifiOff, X } from 'lucide-vue-next'
import { SUPPORT_STATUS_BADGE, SUPPORT_STATUS_LABELS } from '~/types/support.types'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const id = route.params.id as string

const { ticket, messages, loading, error, sending, fetchTicket, sendReply } = useSupportTicket(id)
const { fullName, user } = useAuth()

useSeoMeta({ title: () => ticket.value?.subject ? `${ticket.value.subject} | آسروتراول` : 'تیکت پشتیبانی | آسروتراول' })

const replyText = ref('')
const file = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const listEl = ref<HTMLElement | null>(null)

onMounted(async () => {
  await fetchTicket()
  scrollToBottom()
})

function scrollToBottom() {
  nextTick(() => {
    setTimeout(() => {
      if (listEl.value) listEl.value.scrollTop = listEl.value.scrollHeight
    }, 300)
  })
}

function handleFileChange(e: Event) {
  file.value = (e.target as HTMLInputElement).files?.[0] ?? null
}

function clearFile() {
  file.value = null
  if (fileInput.value) fileInput.value.value = ''
}

async function handleSubmit() {
  if (!replyText.value.trim()) {
    useToast().error('لطفا متن پیام خود را بنویسید')
    return
  }

  const result = await sendReply(replyText.value, file.value)
  if (result.ok) {
    replyText.value = ''
    clearFile()
    scrollToBottom()
  }
  else if (result.error) {
    useToast().error(result.error)
  }
}

function formatDate(iso: string) {
  try {
    const date = new Date(iso)
    const { jy, jm, jd } = toJalali(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate())
    return `${jy.toLocaleString('fa-IR', { useGrouping: false })}/${jm.toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}/${jd.toLocaleString('fa-IR', { minimumIntegerDigits: 2 })}`
  }
  catch {
    return '—'
  }
}

const statusLabel = computed(() => {
  const status = ticket.value?.status
  return status ? (SUPPORT_STATUS_LABELS[status] ?? ticket.value?.statusText) : null
})
const statusBadgeClass = computed(() => {
  const status = ticket.value?.status
  return status ? (SUPPORT_STATUS_BADGE[status] ?? 'badge-ghost') : 'badge-ghost'
})
</script>

<template>
  <div class="px-4 lg:px-16 max-w-960 mx-auto py-8">
    <NuxtLink to="/dashboard/support" class="inline-flex items-center gap-1 text-sm text-base-content/60 hover:text-primary mb-4">
      <ChevronRight :size="16" />
      بازگشت به پشتیبانی
    </NuxtLink>

    <div class="flex items-center justify-between gap-2 mb-6 flex-wrap">
      <h1 class="text-xl font-semibold">{{ ticket?.subject || `تیکت #${id}` }}</h1>
      <span v-if="statusLabel" class="badge" :class="statusBadgeClass">{{ statusLabel }}</span>
    </div>

    <UiLoadingState v-if="loading" label="در حال دریافت تیکت..." />

    <div v-else-if="error" class="bg-base-100 rounded-3xl p-8 text-center">
      <div class="bg-error/10 rounded-full p-4 w-fit mx-auto mb-3">
        <WifiOff :size="28" class="text-error" />
      </div>
      <p class="text-error text-sm mb-4">{{ error }}</p>
      <button class="btn btn-primary btn-sm rounded-xl" @click="fetchTicket">تلاش مجدد</button>
    </div>

    <div v-else class="bg-base-100 rounded-2xl shadow-sm flex flex-col">
      <div ref="listEl" class="overflow-y-auto max-h-[55vh] sm:max-h-[60vh] p-4 sm:p-6 space-y-4">
        <p v-if="!messages.length" class="text-center text-sm text-base-content/40 py-10">
          هنوز پیامی برای این تیکت ثبت نشده است
        </p>

        <div
          v-for="msg in messages"
          :key="msg.id"
          class="flex gap-3 items-start"
          :class="msg.isSupport ? 'justify-start' : 'justify-start flex-row-reverse'"
        >
          <UiAvatar
            :src="msg.isSupport ? null : (user?.ImageUrl ?? null)"
            :name="msg.isSupport ? (msg.userName || 'پشتیبانی') : fullName"
            size="sm"
          />
          <div class="max-w-[80%] sm:max-w-[70%] flex flex-col" :class="msg.isSupport ? 'items-start' : 'items-end'">
            <span class="text-xs font-medium text-base-content/60 mb-1">
              {{ msg.isSupport ? (msg.userName || 'پشتیبانی') : fullName }}
            </span>
            <div
              class="rounded-2xl px-4 py-2.5 text-sm leading-relaxed prose prose-sm max-w-none"
              :class="msg.isSupport ? 'bg-base-200 rounded-tr-none' : 'bg-primary/10 rounded-tl-none'"
              v-html="msg.message"
            />
            <div class="flex items-center gap-2 mt-1 text-[11px] text-base-content/40">
              <span>{{ formatDate(msg.updatedAt) }}</span>
              <a v-if="msg.fileUrl" :href="msg.fileUrl" target="_blank" class="flex items-center gap-1 text-primary hover:underline">
                <Paperclip :size="12" />پیوست
              </a>
            </div>
          </div>
        </div>
      </div>

      <div v-if="ticket?.status !== 'deactive'" class="border-t border-base-200 p-3 sm:p-4">
        <form class="flex items-end gap-2" @submit.prevent="handleSubmit">
          <button type="button" class="btn btn-ghost btn-circle btn-sm shrink-0" @click="fileInput?.click()">
            <Paperclip :size="18" class="text-base-content/50" />
          </button>
          <input ref="fileInput" type="file" hidden @change="handleFileChange" />

          <div class="flex-1">
            <textarea
              v-model="replyText"
              rows="1"
              class="textarea w-full resize-none"
              placeholder="پیام خود را بنویسید..."
            />
            <span v-if="file" class="badge badge-ghost badge-sm gap-1 mt-1">
              {{ file.name }}
              <button type="button" @click="clearFile"><X :size="10" /></button>
            </span>
          </div>

          <button type="submit" class="btn btn-primary btn-circle shrink-0" :disabled="sending">
            <Loader2 v-if="sending" class="size-4 animate-spin" />
            <Send v-else :size="18" class="rotate-180" />
          </button>
        </form>
      </div>
      <div v-else class="border-t border-base-200 p-4 text-center text-sm text-base-content/50">
        این تیکت بسته شده است و امکان ارسال پیام جدید وجود ندارد
      </div>
    </div>
  </div>
</template>
