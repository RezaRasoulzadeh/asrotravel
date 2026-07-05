// components/cart/VipCartDetail.vue
<script setup lang="ts">
import { ArrowRight, ChevronLeft, Minus, Plus, Tag } from 'lucide-vue-next'
import type { VipChangeDateSlot } from '~/types/poolSingle.types'
import type { VipParentInfo } from '~/types/cart.types'
import { formatPrice } from '~/utils/price'

interface Props {
  selectedSlot: VipChangeDateSlot
  serviceId: number
  serviceName: string
  genderCode: 'men' | 'women' | 'any'
  guestCapacity: number
  parent: VipParentInfo
}

const props = defineProps<Props>()
const emit = defineEmits(['back'])

const { user, isAuthenticated } = useAuth()
const { createBooking } = useCreateBooking()
const route = useRoute()

function toEnglishDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06F0))
    .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660))
}

function normalizeMobile(phone: string): string {
  if (!phone) return ''
  let raw = toEnglishDigits(phone).replace(/\D/g, '')
  
  if (raw.startsWith('0098')) {
    raw = '0' + raw.slice(4)
  } else if (raw.startsWith('98') && raw.length >= 12) {
    raw = '0' + raw.slice(2)
  } else if (raw.startsWith('9') && raw.length === 10) {
    raw = '0' + raw
  }
  
  return raw.slice(0, 11)
}

const isSelf = ref(isAuthenticated.value)
const firstName = ref('')
const lastName = ref('')
const nationalCode = ref('')
const mobile = ref('')
const customerNotes = ref('')
const termsAccepted = ref(false)
const headcount = ref(1)
const submitting = ref(false)
const touched = ref(false)

const maxHeadcount = computed(() => Math.max(1, props.guestCapacity || 6))

const originPriceRial = computed(() => Number(props.selectedSlot.price_per_sans ?? 0))
const offerAmountRial = computed(() => Number(props.selectedSlot.offer ?? 0))
const totalPriceWithOfferRial = computed(() => Math.max(0, originPriceRial.value - offerAmountRial.value))
const offerPercent = computed(() => {
  if (originPriceRial.value <= 0) return 0
  return Math.ceil((offerAmountRial.value / originPriceRial.value) * 100)
})

function handleToggleSelf(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.checked && !isAuthenticated.value) {
    e.preventDefault()
    target.checked = false
    useToast().error('برای ادامه باید وارد حساب کاربری خود شوید')
    navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  isSelf.value = target.checked
}

function applyOwnInfo() {
  if (!user.value) return
  firstName.value = user.value.first_name ?? ''
  lastName.value = user.value.last_name ?? ''
  nationalCode.value = user.value.national_id ?? ''
  mobile.value = normalizeMobile(user.value.mobile ?? '')
}

function clearInfo() {
  firstName.value = ''
  lastName.value = ''
  nationalCode.value = ''
  mobile.value = ''
}

watch(isSelf, (v) => {
  if (v) applyOwnInfo()
  else clearInfo()
}, { immediate: true })

function onMobileInput(e: Event) {
  if (isAuthenticated.value && isSelf.value) return 
  mobile.value = normalizeMobile((e.target as HTMLInputElement).value)
}

function onNationalCodeInput(e: Event) {
  const raw = toEnglishDigits((e.target as HTMLInputElement).value).replace(/\D/g, '')
  nationalCode.value = raw.slice(0, 10)
}

function isValidNationalCode(code: string): boolean {
  if (!/^\d{10}$/.test(code)) return false
  if (/^(\d)\1{9}$/.test(code)) return false
  const check = Number(code[9])
  const sum = Array.from({ length: 9 }, (_, i) => Number(code[i]) * (10 - i)).reduce((a, b) => a + b, 0)
  const remainder = sum % 11
  return remainder < 2 ? check === remainder : check === 11 - remainder
}

function isValidMobile(value: string): boolean {
  return /^09\d{9}$/.test(value)
}

const errors = computed(() => ({
  firstName: firstName.value.trim() ? '' : 'لطفا نام خود را وارد کنید',
  lastName: lastName.value.trim() ? '' : 'لطفا نام خانوادگی خود را وارد کنید',
  nationalCode: isValidNationalCode(nationalCode.value) ? '' : 'کدملی وارد شده معتبر نیست',
  mobile: isValidMobile(mobile.value) ? '' : 'شماره تلفن وارد شده اشتباه است',
}))

const isFormValid = computed(() =>
  !errors.value.firstName &&
  !errors.value.lastName &&
  !errors.value.nationalCode &&
  !errors.value.mobile &&
  termsAccepted.value
)

const increase = () => { if (headcount.value < maxHeadcount.value) headcount.value++ }
const decrease = () => { if (headcount.value > 1) headcount.value-- }

const checkout = async () => {
  touched.value = true
  if (!isFormValid.value || submitting.value) return

  if (!props.serviceId || !props.parent?.slug) {
    useToast().error('اطلاعات این سرویس ناقص است، لطفا دوباره از تقویم اقدام کنید')
    return
  }

  submitting.value = true

  try {
    const { data, error } = await createBooking({
      service_type: 'Pool',
      service_id: props.serviceId,
      service: {
        ...props.selectedSlot,
        service_type: 'vip',
        total_price: originPriceRial.value,
        total_price_with_offer: totalPriceWithOfferRial.value,
        quantity: { adult: { quantity: headcount.value } },
      },
      userInfo: {
        first_name: firstName.value.trim(),
        last_name: lastName.value.trim(),
        mobile: mobile.value,
        gender: '',
        national_code: nationalCode.value,
        email: '',
      },
      term_accepted: termsAccepted.value,
      is_customer: isSelf.value ? '100' : '0',
      customer_notes: customerNotes.value.trim(),
      adults: headcount.value,
      children: 0,
      date: props.selectedSlot.day?.day_date ?? '',
      display_date: props.selectedSlot.date_display,
      total_price_display: formatPrice(originPriceRial.value),
      total_price: originPriceRial.value,
      total_price_with_offer_display: formatPrice(totalPriceWithOfferRial.value),
      total_price_with_offer: totalPriceWithOfferRial.value,
      rooms: [],
      parent: props.parent
    })

    if (error || !data?.booking_code) return
    await navigateTo(`/cart/checkout/${data.booking_code}`)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div dir="rtl" class="w-full">
    <div class="bg-base-100 rounded-3xl border border-base-300 p-6 md:p-8 shadow-sm">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-base-300 mb-6 gap-4">
        <button @click="emit('back')" class="btn btn-ghost btn-secondary">
          <ArrowRight class="size-5" />
          <span>بازگشت به انتخاب زمان</span>
        </button>
        <div class="flex items-center gap-4 flex-wrap">
          <div class="bg-base-200 px-3 py-1.5 rounded-lg border border-base-300">
            <span class="text-sm font-mono tracking-wider">{{ selectedSlot.time_display }}</span>
          </div>
          <div class="font-bold text-lg">{{ selectedSlot.day?.day_name }} - {{ selectedSlot.date_display }}</div>
          <div class="badge badge-neutral">{{ serviceName }}</div>
        </div>
      </div>

      <form @submit.prevent="checkout">
      <label class="flex items-center gap-3 mb-6 cursor-pointer w-fit">
        <input 
          type="checkbox" 
          class="toggle toggle-primary" 
          :checked="isSelf" 
          @change="handleToggleSelf"
        />
        <span class="text-sm font-medium">استفاده کننده خودم هستم</span>
      </label>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div class="form-control w-full">
          <label class="label" for="vip-first-name">
            <span class="label-text">نام <span class="text-error">*</span></span>
          </label>
          <input
            id="vip-first-name"
            v-model="firstName"
            type="text"
            name="given-name"
            autocomplete="given-name"
            placeholder="نام"
            :disabled="isSelf && isAuthenticated && !!user?.first_name"
            class="input w-full"
            :class="{ 'input-error': touched && errors.firstName }"
          />
          <span v-if="touched && errors.firstName" class="text-error text-xs mt-1">{{ errors.firstName }}</span>
        </div>

        <div class="form-control w-full">
          <label class="label" for="vip-last-name">
            <span class="label-text">نام خانوادگی <span class="text-error">*</span></span>
          </label>
          <input
            id="vip-last-name"
            v-model="lastName"
            type="text"
            name="family-name"
            autocomplete="family-name"
            placeholder="نام خانوادگی"
            :disabled="isSelf && isAuthenticated && !!user?.last_name"
            class="input w-full"
            :class="{ 'input-error': touched && errors.lastName }"
          />
          <span v-if="touched && errors.lastName" class="text-error text-xs mt-1">{{ errors.lastName }}</span>
        </div>

        <div class="form-control w-full">
          <label class="label" for="vip-national-code">
            <span class="label-text">کدملی <span class="text-error">*</span></span>
          </label>
          <input
            id="vip-national-code"
            :value="nationalCode"
            @input="onNationalCodeInput"
            type="text"
            name="national-code"
            autocomplete="off"
            inputmode="numeric"
            placeholder="کدملی"
            :disabled="isSelf && isAuthenticated && !!user?.national_id"
            class="input w-full"
            :class="{ 'input-error': touched && errors.nationalCode }"
          />
          <span v-if="touched && errors.nationalCode" class="text-error text-xs mt-1">{{ errors.nationalCode }}</span>
        </div>

        <div class="form-control w-full">
          <label class="label" for="vip-mobile">
            <span class="label-text">شماره موبایل <span class="text-error">*</span></span>
          </label>
          <input
            id="vip-mobile"
            :value="mobile"
            @input="onMobileInput"
            type="tel"
            name="tel"
            autocomplete="tel"
            inputmode="numeric"
            placeholder="0912XXXXXXX"
            dir="ltr"
            :disabled="isSelf && isAuthenticated"
            class="input w-full text-left"
            :class="{ 'input-error': touched && errors.mobile }"
          />
          <span v-if="touched && errors.mobile" class="text-error text-xs mt-1">{{ errors.mobile }}</span>
        </div>
      </div>

      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-base-200/50 p-4 rounded-xl mb-6 gap-2">
        <span class="text-base-content/70">مبلغ قابل پرداخت:</span>
        <div class="flex items-center gap-2">
          <span v-if="offerPercent > 0" class="badge badge-success badge-sm text-white font-mono">{{ offerPercent }}%</span>
          <span v-if="offerAmountRial > 0" class="text-base-content/40 line-through text-xs">
            {{ formatPrice(originPriceRial) }}
          </span>
          <span class="font-bold text-lg text-primary flex items-center gap-1">
            <Tag v-if="offerAmountRial > 0" :size="14" class="text-error" />
            {{ formatPrice(totalPriceWithOfferRial) }}
          </span>
        </div>
      </div>

      <div class="flex justify-between items-center bg-base-200/50 p-4 rounded-xl mb-6">
        <span class="text-base-content/70">تعداد نفرات:</span>
        <div class="flex items-center gap-3 bg-base-100 rounded-lg p-1 border border-base-300 shadow-sm">
          <button type="button" @click="increase" :disabled="headcount >= maxHeadcount" class="btn btn-sm btn-ghost btn-square">
            <Plus :size="16" />
          </button>
          <span class="w-8 text-center font-bold">{{ headcount.toLocaleString('fa-IR') }}</span>
          <button type="button" @click="decrease" :disabled="headcount <= 1" class="btn btn-sm btn-ghost btn-square">
            <Minus :size="16" />
          </button>
        </div>
      </div>

      <div class="form-control w-full mb-6">
        <label class="label" for="vip-notes"><span class="label-text">نیازمندی‌های ویژه</span></label>
        <textarea
          id="vip-notes"
          v-model="customerNotes"
          maxlength="200"
          rows="4"
          name="notes"
          autocomplete="off"
          placeholder="نیازمندی‌های خود را برای مجموعه یادداشت کنید"
          class="textarea w-full"
        />
      </div>

      <label class="flex items-start gap-2 mb-8 cursor-pointer">
        <input type="checkbox" v-model="termsAccepted" class="checkbox checkbox-sm mt-0.5" />
        <span class="text-xs sm:text-sm text-base-content/70">
          با تایید شما با قوانین و مقررات مجموعه و آسروتراول موافق هستید
        </span>
      </label>
      <span v-if="touched && !termsAccepted" class="text-error text-xs -mt-6 block mb-6">
        لطفا قوانین و مقررات را تایید کنید
      </span>

      <div class="pt-6 border-t border-base-300 flex justify-end">
        <button
          type="submit"
          class="group btn btn-primary btn-lg w-full sm:w-64 text-base gap-0"
          :disabled="submitting || !termsAccepted"
        >
          <span v-if="submitting" class="loading loading-spinner loading-sm" />
          <template v-else>
            <span class="pt-0.5">ادامه جهت پرداخت</span>
            <ChevronLeft class="size-6 transition-transform duration-200 group-hover:-translate-x-2" />
          </template>
        </button>
      </div>
      </form>
    </div>
  </div>
</template>