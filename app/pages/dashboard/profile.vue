<!-- app/pages/dashboard/profile.vue -->
<script setup lang="ts">
import { Camera, Loader2, Save } from 'lucide-vue-next'
import type { UpdateProfilePayload } from '~/types/profile.types'

definePageMeta({ layout: 'dashboard' })
useSeoMeta({ title: 'پروفایل | آسروتراول' })

const { user, fullName } = useAuth()
const { loading, updateProfile } = useUpdateProfile()
const { loading: avatarLoading, uploadAvatar } = useUploadAvatar()

const photoInput = ref<HTMLInputElement | null>(null)
const localPreview = ref<string | null>(null)

const success = ref('')
let successTimeout: ReturnType<typeof setTimeout> | null = null

function showSuccess(message: string) {
  success.value = message
  if (successTimeout) clearTimeout(successTimeout)
  successTimeout = setTimeout(() => { success.value = '' }, 4000)
}

async function handleAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (ev) => { localPreview.value = ev.target?.result as string }
  reader.readAsDataURL(file)

  const result = await uploadAvatar(file)
  localPreview.value = null

  if (result.ok && result.url) {
    form.imageUrl = result.url
    error.value = ''
    showSuccess('تصویر پروفایل بروزرسانی شد')
  } else if (result.error) {
    error.value = result.error
  }

  if (photoInput.value) photoInput.value.value = ''
}

function daysInJalaliMonth(jy: number, jm: number): number {
  if (jm <= 6) return 31
  if (jm <= 11) return 30
  return (((jy - (jy > 474 ? 473 : 474)) % 2820 + 474 + 38) * 682) % 2816 < 682 ? 30 : 29
}

const today = toJalaliDash(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())

const years = Array.from({ length: today.jy - 1299 }, (_, i) => today.jy - i)
const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']

// TODO: confirm gender value mapping (1/2) against the backend enum
const genderOptions = [
  { value: 1, label: 'مرد' },
  { value: 2, label: 'زن' },
]

function parseBirthday(value: string | null | undefined) {
  const [y, m, d] = (value ?? '').split('/').map(Number)
  return {
    y: y || today.jy,
    m: m || 1,
    d: d || 1,
  }
}

const initialBirthday = parseBirthday(user.value?.birthday)

const form = reactive({
  first_name: user.value?.first_name ?? '',
  last_name: user.value?.last_name ?? '',
  national_id: user.value?.national_id ?? '',
  email: user.value?.email ?? '',
  address: user.value?.address ?? '',
  imageUrl: user.value?.ImageUrl ?? '',
  gender: user.value?.gender ?? null as number | null,
  birthYear: initialBirthday.y,
  birthMonth: initialBirthday.m,
  birthDay: initialBirthday.d,
})

const days = computed(() => {
  const max = daysInJalaliMonth(form.birthYear, form.birthMonth)
  if (form.birthDay > max) form.birthDay = max
  return Array.from({ length: max }, (_, i) => i + 1)
})

const error = ref('')

watch(
  () => [
    form.first_name,
    form.last_name,
    form.national_id,
    form.email,
    form.address,
    form.gender,
    form.birthYear,
    form.birthMonth,
    form.birthDay,
  ],
  () => { success.value = '' },
)

async function handleSubmit() {
  error.value = ''

  if (!form.first_name.trim() || !form.last_name.trim()) {
    error.value = 'نام و نام خانوادگی الزامی است'
    return
  }

  if (!user.value) return

  const payload: UpdateProfilePayload = {
    id: user.value.id,
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    national_id: form.national_id.trim(),
    email: form.email.trim(),
    mobile: user.value.mobile,
    birthday: `${form.birthYear}/${String(form.birthMonth).padStart(2, '0')}/${String(form.birthDay).padStart(2, '0')}`,
    gender: form.gender,
    address: form.address.trim() || null,
    ImageUrl: form.imageUrl.trim() || null,
  }

  const result = await updateProfile(payload)
  if (result.ok) {
    showSuccess('تغییرات با موفقیت ذخیره شد')
  } else if (result.error) {
    error.value = result.error
  }
}
</script>

<template>
  <div class="px-4 lg:px-6 max-w-960 mx-auto py-4 lg:py-6">

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">

      <div class="card bg-base-100 lg:col-span-1">
        <div class="card-body p-6 gap-4 items-center text-center">
          <div class="relative">
            <UiAvatar :src="localPreview || form.imageUrl || null" :name="fullName" size="xl" />
            <div
              v-if="avatarLoading"
              class="absolute inset-0 flex items-center justify-center bg-base-100/60 rounded-full"
            >
              <Loader2 class="size-5 animate-spin text-primary" />
            </div>
          </div>
          <div>
            <p class="font-semibold">{{ fullName }}</p>
            <p class="text-xs text-base-content/50 mt-0.5" dir="ltr">{{ user?.mobile }}</p>
          </div>

          <button
            type="button"
            class="btn btn-sm btn-outline rounded-xl"
            :disabled="avatarLoading"
            @click="photoInput?.click()"
          >
            <Camera class="size-4" />
            آپلود تصویر پروفایل
          </button>
          <input ref="photoInput" type="file" accept="image/*" class="hidden" @change="handleAvatarChange" />
        </div>
      </div>

      <div class="card bg-base-100 lg:col-span-2">
        <div class="card-body p-6 gap-5">
          <h2 class="text-sm font-semibold text-base-content/70">اطلاعات حساب کاربری</h2>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <fieldset class="fieldset gap-2">
              <legend class="fieldset-legend">نام</legend>
              <label class="input w-full">
                <input v-model="form.first_name" type="text" class="grow" />
              </label>
            </fieldset>

            <fieldset class="fieldset gap-2">
              <legend class="fieldset-legend">نام خانوادگی</legend>
              <label class="input w-full">
                <input v-model="form.last_name" type="text" class="grow" />
              </label>
            </fieldset>

            <fieldset class="fieldset gap-2">
              <legend class="fieldset-legend">کد ملی</legend>
              <label class="input w-full" dir="ltr">
                <input v-model="form.national_id" type="text" class="grow" maxlength="10" />
              </label>
            </fieldset>

            <fieldset class="fieldset gap-2">
              <legend class="fieldset-legend">ایمیل</legend>
              <label class="input w-full" dir="ltr">
                <input v-model="form.email" type="email" class="grow" />
              </label>
            </fieldset>

            <fieldset class="fieldset gap-2">
              <legend class="fieldset-legend">موبایل</legend>
              <label class="input w-full bg-base-200" dir="ltr">
                <input :value="user?.mobile" type="text" class="grow" disabled />
              </label>
            </fieldset>

            <fieldset class="fieldset gap-2">
              <legend class="fieldset-legend">جنسیت</legend>
              <select v-model="form.gender" class="select-custom">
                <option :value="null">تعیین نشده</option>
                <option v-for="g in genderOptions" :key="g.value" :value="g.value">{{ g.label }}</option>
              </select>
            </fieldset>

            <fieldset class="fieldset gap-2 sm:col-span-2">
              <legend class="fieldset-legend">آدرس</legend>
              <label class="input w-full">
                <input v-model="form.address" type="text" class="grow" />
              </label>
            </fieldset>
          </div>

          <div class="space-y-2">
            <p class="fieldset-legend">تاریخ تولد</p>
            <div class="grid grid-cols-3 gap-3">
              <select v-model="form.birthYear" class="select-custom">
                <option v-for="y in years" :key="y" :value="y">{{ y.toLocaleString('fa-IR', { useGrouping: false }) }}</option>
              </select>
              <select v-model="form.birthMonth" class="select-custom">
                <option v-for="(m, i) in months" :key="i" :value="i + 1">{{ m }}</option>
              </select>
              <select v-model="form.birthDay" class="select-custom">
                <option v-for="d in days" :key="d" :value="d">{{ d.toLocaleString('fa-IR') }}</option>
              </select>
            </div>
          </div>

          <p v-if="error" class="text-xs text-error">{{ error }}</p>
          <p v-if="success" class="text-xs text-success">{{ success }}</p>

          <button
            class="btn btn-primary w-full sm:w-auto rounded-xl self-end"
            :disabled="loading"
            @click="handleSubmit"
          >
            <Loader2 v-if="loading" class="size-4 animate-spin" />
            <template v-else>
              <Save class="size-4" />
              ذخیره تغییرات
            </template>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>