<!-- app/pages/dashboard/support/new.vue -->
<script setup lang="ts">
import { ChevronRight, Loader2, Paperclip, Send, X } from 'lucide-vue-next'
import { SUPPORT_DEPARTMENTS, SUPPORT_PRIORITIES } from '~/types/support.types'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'تیکت جدید | آسروتراول' })

const { loading, submit } = useNewSupportTicket()

const form = reactive({
  subject: '',
  department: '',
  priority: 'medium',
  message: '',
})
const file = ref<File | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)
const error = ref('')
const touched = ref(false)

const errors = computed(() => ({
  subject: !form.subject.trim() ? 'موضوع تیکت را وارد کنید' : '',
  department: !form.department ? 'یک دپارتمان انتخاب کنید' : '',
  message: !form.message.trim() ? 'متن پیام خود را بنویسید' : '',
}))
const isValid = computed(() => !errors.value.subject && !errors.value.department && !errors.value.message)

function handleFileChange(e: Event) {
  file.value = (e.target as HTMLInputElement).files?.[0] ?? null
}

function clearFile() {
  file.value = null
  if (fileInput.value) fileInput.value.value = ''
}

async function handleSubmit() {
  touched.value = true
  error.value = ''
  if (!isValid.value) return

  const result = await submit({
    subject: form.subject,
    department: form.department,
    priority: form.priority,
    message: form.message,
    file: file.value,
  })

  if (result.ok) {
    useToast().success('تیکت شما با موفقیت ثبت شد')
    await navigateTo('/dashboard/support')
  }
  else if (result.error) {
    error.value = result.error
  }
}
</script>

<template>
  <div class="px-4 lg:px-16 max-w-960 mx-auto py-8">
    <NuxtLink to="/dashboard/support" class="inline-flex items-center gap-1 text-sm text-base-content/60 hover:text-primary mb-4">
      <ChevronRight :size="16" />
      بازگشت به پشتیبانی
    </NuxtLink>

    <h1 class="text-xl font-semibold mb-6">ثبت تیکت جدید</h1>

    <div class="card bg-base-100 shadow-sm max-w-2xl">
      <form class="card-body p-6 gap-4" @submit.prevent="handleSubmit">
        <fieldset class="fieldset gap-1.5">
          <legend class="fieldset-legend">موضوع تیکت</legend>
          <label class="input w-full">
            <input v-model="form.subject" type="text" class="grow" placeholder="موضوع تیکت خود را وارد کنید" />
          </label>
          <p v-if="touched && errors.subject" class="text-xs text-error">{{ errors.subject }}</p>
        </fieldset>

        <fieldset class="fieldset gap-1.5">
          <legend class="fieldset-legend">دپارتمان</legend>
          <select v-model="form.department" class="select-custom">
            <option value="" disabled>یک دپارتمان انتخاب کنید</option>
            <option v-for="d in SUPPORT_DEPARTMENTS" :key="d.value" :value="d.value">{{ d.title }}</option>
          </select>
          <p v-if="touched && errors.department" class="text-xs text-error">{{ errors.department }}</p>
        </fieldset>

        <fieldset class="fieldset gap-1.5">
          <legend class="fieldset-legend">اولویت</legend>
          <select v-model="form.priority" class="select-custom">
            <option v-for="p in SUPPORT_PRIORITIES" :key="p.value" :value="p.value">{{ p.title }}</option>
          </select>
        </fieldset>

        <fieldset class="fieldset gap-1.5">
          <legend class="fieldset-legend">متن پیام</legend>
          <textarea
            v-model="form.message"
            rows="6"
            class="textarea w-full"
            placeholder="مشکل یا سوال خود را به طور کامل شرح دهید..."
          />
          <p v-if="touched && errors.message" class="text-xs text-error">{{ errors.message }}</p>
        </fieldset>

        <div class="flex items-center gap-2">
          <button type="button" class="btn btn-sm btn-outline rounded-xl gap-1" @click="fileInput?.click()">
            <Paperclip :size="16" />
            پیوست فایل
          </button>
          <span v-if="file" class="badge badge-ghost gap-1">
            {{ file.name }}
            <button type="button" @click="clearFile"><X :size="12" /></button>
          </span>
          <input ref="fileInput" type="file" hidden @change="handleFileChange" />
        </div>

        <p v-if="error" class="text-xs text-error">{{ error }}</p>

        <button type="submit" class="btn btn-primary rounded-xl w-full sm:w-auto self-end" :disabled="loading">
          <Loader2 v-if="loading" class="size-4 animate-spin" />
          <template v-else>
            <Send :size="16" />
            ثبت تیکت
          </template>
        </button>
      </form>
    </div>
  </div>
</template>
