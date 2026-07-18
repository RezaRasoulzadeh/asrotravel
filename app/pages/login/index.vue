<!-- pages/login/index.vue -->
<script setup lang="ts">
import { Phone, Loader2, ArrowRight } from 'lucide-vue-next'
import logoLight from '~/assets/images/logo-light.svg'
import logoDark from '~/assets/images/logo-dark.svg'

definePageMeta({ layout: 'blank' })

const router = useRouter()
const route  = useRoute()
const { sendOtp, verifyOtp, isAuthenticated } = useAuth()

const theme = useCookie<'light' | 'dark'>('asro_theme')
const logoSrc = computed(() => theme.value === 'dark' ? logoDark : logoLight)
if (isAuthenticated.value) router.replace((route.query.redirect as string) || '/')

type Step = 'phone' | 'otp'
const step    = ref<Step>('phone')
const loading = ref(false)
const error   = ref('')

function toEnglishDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06F0))
    .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660))
}

function toPersianDigits(str: string): string {
  return str.replace(/[0-9]/g, d => String.fromCharCode(0x06F0 + Number(d)))
}

const phoneInputRef  = ref<HTMLInputElement | null>(null)
const mobileDisplay  = ref('')
const mobileEnglish  = ref('')

function onMobileInput(e: Event) {
  const raw    = (e.target as HTMLInputElement).value
  let english  = toEnglishDigits(raw).replace(/\D/g, '')

  if (english.startsWith('98') && english.length > 10) english = english.slice(2)
  else if (english.startsWith('0')) english = english.slice(1)

  english = english.slice(0, 10)

  mobileEnglish.value = english
  mobileDisplay.value = toPersianDigits(english)

  nextTick(() => {
    (e.target as HTMLInputElement).value = mobileDisplay.value
  })
}

const normalizedMobile = computed(() => mobileEnglish.value)
const fullMobile       = computed(() => `+98${normalizedMobile.value}`)

const OTP_LENGTH = 5
const otpRefs    = ref<HTMLInputElement[]>([])
const otpDigits  = ref<string[]>(Array(OTP_LENGTH).fill(''))
const otpValue   = computed(() => otpDigits.value.join(''))

function focusCell(i: number) {
  otpRefs.value[i]?.focus()
}

function onOtpInput(e: Event, i: number) {
  const input = e.target as HTMLInputElement
  const val   = toEnglishDigits(input.value).replace(/\D/g, '')

  if (val.length > 1) {
    const digits = val.slice(0, OTP_LENGTH).split('')
    digits.forEach((d, idx) => { otpDigits.value[idx] = d })
    for (let j = digits.length; j < OTP_LENGTH; j++) otpDigits.value[j] = ''
    const nextEmpty = otpDigits.value.findIndex(d => d === '')
    focusCell(nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty)
    checkAutoSubmit()
    return
  }

  otpDigits.value[i] = val.slice(-1)
  input.value = otpDigits.value[i]
  if (val && i < OTP_LENGTH - 1) focusCell(i + 1)
  checkAutoSubmit()
}

function onOtpKeydown(e: KeyboardEvent, i: number) {
  if (e.key === 'Backspace') {
    if (otpDigits.value[i]) {
      otpDigits.value[i] = ''
    } else if (i > 0) {
      otpDigits.value[i - 1] = ''
      focusCell(i - 1)
    }
    e.preventDefault()
  } else if (e.key === 'ArrowLeft') {
    focusCell(Math.min(i + 1, OTP_LENGTH - 1))
  } else if (e.key === 'ArrowRight') {
    focusCell(Math.max(i - 1, 0))
  }
}

function onOtpPaste(e: ClipboardEvent) {
  e.preventDefault()
  const text   = toEnglishDigits(e.clipboardData?.getData('text') ?? '').replace(/\D/g, '')
  const digits = text.slice(0, OTP_LENGTH).split('')
  digits.forEach((d, i) => { otpDigits.value[i] = d })
  for (let j = digits.length; j < OTP_LENGTH; j++) otpDigits.value[j] = ''
  const nextEmpty = otpDigits.value.findIndex(d => d === '')
  focusCell(nextEmpty === -1 ? OTP_LENGTH - 1 : nextEmpty)
  checkAutoSubmit()
}

function checkAutoSubmit() {
  if (otpDigits.value.every(d => d !== '')) handleVerifyOtp()
}

const { start: startWebOtp, stop: stopWebOtp } = useWebOtp((code) => {
  const digits = toEnglishDigits(code).replace(/\D/g, '').slice(0, OTP_LENGTH).split('')
  if (digits.length !== OTP_LENGTH) return
  digits.forEach((d, i) => { otpDigits.value[i] = d })
  checkAutoSubmit()
})

const RESEND_SECONDS = 180
const resendTimer    = ref(0)
let   timerInterval  : ReturnType<typeof setInterval> | null = null

const resendDisplay = computed(() => {
  const m  = Math.floor(resendTimer.value / 60)
  const s  = resendTimer.value % 60
  const mm = toPersianDigits(String(m).padStart(2, '0'))
  const ss = toPersianDigits(String(s).padStart(2, '0'))
  return `${mm}:${ss}`
})

function startResendTimer() {
  resendTimer.value = RESEND_SECONDS
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0 && timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }, 1000)
}

onMounted(() => phoneInputRef.value?.focus())
onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  stopWebOtp()
})

function backToPhone() {
  step.value      = 'phone'
  error.value     = ''
  otpDigits.value = Array(OTP_LENGTH).fill('')
  if (timerInterval) clearInterval(timerInterval)
  stopWebOtp()
  nextTick(() => phoneInputRef.value?.focus())
}

async function handleSendOtp() {
  error.value = ''
  if (normalizedMobile.value.length !== 10) {
    error.value = 'شماره موبایل باید ۱۰ رقم باشد'
    return
  }
  loading.value = true
  const result  = await sendOtp(normalizedMobile.value)
  loading.value = false
  if (result.ok) {
    step.value = 'otp'
    startResendTimer()
    startWebOtp()
    nextTick(() => focusCell(0))
  } else {
    error.value = result.error ?? 'خطا'
  }
}

async function handleResend() {
  if (resendTimer.value > 0 || loading.value) return
  error.value   = ''
  loading.value = true
  const result  = await sendOtp(normalizedMobile.value)
  loading.value = false
  if (result.ok) {
    otpDigits.value = Array(OTP_LENGTH).fill('')
    startResendTimer()
    startWebOtp()
    nextTick(() => focusCell(0))
  } else {
    error.value = result.error ?? 'خطا'
  }
}

async function handleVerifyOtp() {
  if (loading.value) return
  error.value   = ''
  loading.value = true
  const result  = await verifyOtp(fullMobile.value, otpValue.value)
  loading.value = false
  if (result.ok) {
    stopWebOtp()
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } else {
    error.value     = result.error ?? 'کد تأیید نادرست است'
    otpDigits.value = Array(OTP_LENGTH).fill('')
    nextTick(() => focusCell(0))
  }
}
</script>

<template>
  <div class="min-h-screen bg-base-200 flex items-center justify-center px-4">
    <div class="card bg-base-100 shadow-xl w-full max-w-sm rounded-3xl">
      <div class="card-body gap-6 p-8">

        <!-- Logo -->
        <div class="flex justify-center mb-1">
          <NuxtLink to="/">
            <img :src="logoSrc" alt="آسروتراول" class="h-18" />
          </NuxtLink>
        </div>

        <!-- ── Step: Phone ── -->
        <template v-if="step === 'phone'">
          <div class="flex flex-col gap-1">
            <h1 class="text-lg font-bold text-base-content">ورود / ثبت‌نام</h1>
            <p class="text-xs text-base-content/50">شماره موبایل خود را وارد کنید</p>
          </div>

          <fieldset class="fieldset gap-2">
            <legend class="fieldset-legend">شماره موبایل</legend>
            <label class="input w-full flex items-center gap-2" dir="ltr">
              <Phone class="size-4 text-base-content/40 shrink-0" />
              <span class="text-sm text-base-content/60 shrink-0">+۹۸</span>
              <input
                ref="phoneInputRef"
                :value="mobileDisplay"
                type="tel"
                placeholder="۹۱۲ ۰۰۰ ۰۰۰۰"
                maxlength="10"
                class="grow text-left min-w-0"
                @input="onMobileInput"
                @keyup.enter="handleSendOtp"
              />
            </label>
            <p v-if="error" class="text-xs text-error">{{ error }}</p>
          </fieldset>

          <button
            class="btn btn-primary w-full rounded-xl"
            :disabled="loading"
            @click="handleSendOtp"
          >
            <Loader2 v-if="loading" class="size-4 animate-spin" />
            <span v-else>ارسال کد تأیید</span>
          </button>
        </template>

        <!-- ── Step: OTP ── -->
        <template v-else>
          <div class="flex flex-col gap-1">
            <h1 class="text-lg font-bold text-base-content">کد تأیید</h1>
            <p class="text-xs text-base-content/50">
              کد ارسال‌شده به
              <span class="font-mono font-medium text-base-content" dir="ltr">{{ fullMobile }}</span>
              را وارد کنید
            </p>
          </div>

          <!-- Split OTP cells -->
          <div class="flex gap-2 justify-center" dir="ltr">
            <input
              v-for="(_, i) in OTP_LENGTH"
              :key="i"
              :ref="el => { if (el) otpRefs[i] = el as HTMLInputElement }"
              :value="otpDigits[i]"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="2"
              class="input input-bordered w-11 h-12 text-center text-lg font-bold font-mono p-0 rounded-xl transition-colors"
              :class="otpDigits[i] ? 'input-primary' : ''"
              :disabled="loading"
              @input="onOtpInput($event, i)"
              @keydown="onOtpKeydown($event, i)"
              @paste="onOtpPaste"
              @focus="($event.target as HTMLInputElement).select()"
            />
          </div>

          <p v-if="error" class="text-xs text-error text-center -mt-2">{{ error }}</p>

          <!-- Loading / resend -->
          <div class="flex items-center justify-center gap-2 text-xs min-h-6">
            <template v-if="loading">
              <Loader2 class="size-4 animate-spin text-primary" />
            </template>
            <template v-else-if="resendTimer > 0">
              <span class="text-base-content/40">ارسال مجدد تا</span>
              <span class="font-medium text-base-content/60">{{ resendDisplay }}</span>
            </template>
            <button
              v-else
              class="btn btn-ghost btn-xs text-primary"
              @click="handleResend"
            >
              ارسال مجدد کد
            </button>
          </div>

          <button
            class="btn btn-ghost btn-sm w-full gap-1 text-base-content/50"
            :disabled="loading"
            @click="backToPhone"
          >
            <ArrowRight class="size-4" />
            تغییر شماره
          </button>
        </template>

      </div>
    </div>
  </div>
</template>