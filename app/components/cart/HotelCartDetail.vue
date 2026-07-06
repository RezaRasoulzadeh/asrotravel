// components/cart/HotelCartDetail.vue
<script setup lang="ts">
import { ArrowRight, ChevronLeft, BedDouble, Users, Baby } from 'lucide-vue-next'
import type { HotelRoom } from '~/types/hotelSingle.types'
import type { HotelCartAddPayload, HotelCartAddRoom } from '~/types/cart.types'
import { formatPrice } from '~/utils/price'

interface Props {
  hotelId: number
  hotelTitle: string
  hotelSlug: string
  startDate: string
  endDate: string
  nightCount: number
  selectedRooms: HotelRoom[]
}

const props = defineProps<Props>()
const emit = defineEmits(['back'])

const { user, isAuthenticated } = useAuth()
const { createBooking } = useCreateBooking()
const { jalaliStart, jalaliEnd } = useJalaliDates(
  computed(() => props.startDate),
  computed(() => props.endDate),
)
const route = useRoute()

function toEnglishDigits(str: string): string {
  return str
    .replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06F0))
    .replace(/[٠-٩]/g, d => String(d.charCodeAt(0) - 0x0660))
}

function toFaDigits(str: string): string {
  const digits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return str.replace(/\d/g, d => digits[Number(d)] ?? d)
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
const email = ref('')
const gender = ref<'men' | 'women' | ''>('')
const termsAccepted = ref(false)
const submitting = ref(false)
const touched = ref(false)

function genderFromUser(code: number | undefined): 'men' | 'women' | '' {
  if (code === 1) return 'men'
  if (code === 2) return 'women'
  return ''
}

function applyOwnInfo() {
  if (!user.value) return
  firstName.value = user.value.first_name ?? ''
  lastName.value = user.value.last_name ?? ''
  nationalCode.value = user.value.national_id ?? ''
  mobile.value = normalizeMobile(user.value.mobile ?? '')
  email.value = user.value.email ?? ''
  gender.value = genderFromUser(user.value.gender)
}

function clearInfo() {
  firstName.value = ''
  lastName.value = ''
  nationalCode.value = ''
  mobile.value = ''
  email.value = ''
  gender.value = ''
}

watch(isSelf, (v) => {
  if (v) applyOwnInfo()
  else clearInfo()
}, { immediate: true })

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

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

const errors = computed(() => ({
  firstName: firstName.value.trim() ? '' : 'لطفا نام خود را وارد کنید',
  lastName: lastName.value.trim() ? '' : 'لطفا نام خانوادگی خود را وارد کنید',
  nationalCode: isValidNationalCode(nationalCode.value) ? '' : 'کدملی وارد شده معتبر نیست',
  mobile: isValidMobile(mobile.value) ? '' : 'شماره تلفن وارد شده اشتباه است',
  email: isValidEmail(email.value) ? '' : 'ایمیل وارد شده معتبر نیست',
  gender: gender.value ? '' : 'لطفا جنسیت را انتخاب کنید',
}))

const isFormValid = computed(() =>
  !errors.value.firstName &&
  !errors.value.lastName &&
  !errors.value.nationalCode &&
  !errors.value.mobile &&
  !errors.value.email &&
  !errors.value.gender &&
  termsAccepted.value
)

const totalPriceRial = computed(() =>
  props.selectedRooms.reduce((sum, r) => sum + (r.price || 0) * (r.number_selected || 1), 0)
)

const totalPriceWithOfferRial = computed(() =>
  props.selectedRooms.reduce((sum, r) => sum + (r.price_with_offer || 0) * (r.number_selected || 1), 0)
)

const totalAdults = computed(() =>
  props.selectedRooms.reduce((sum, r) => sum + (r.adults || 0) * (r.number_selected || 1), 0)
)

const totalChildren = computed(() =>
  props.selectedRooms.reduce((sum, r) => sum + (r.children || 0) * (r.number_selected || 1), 0)
)

function stripZeroPad(jalali: string): string {
  if (!jalali) return ''
  return jalali.split('/').map(part => String(Number(part))).join('/')
}

const displayDate = computed(() => {
  const start = toFaDigits(stripZeroPad(jalaliStart.value))
  const end = toFaDigits(stripZeroPad(jalaliEnd.value))
  return start && end ? `${start} - ${end}` : ''
})

const checkout = async () => {
  touched.value = true
  if (!isFormValid.value || submitting.value) return

  if (!props.hotelId || !props.selectedRooms.length) {
    useToast().error('اطلاعات این رزرو ناقص است، لطفا دوباره اتاق مورد نظر را انتخاب کنید')
    return
  }

  submitting.value = true

  try {
    const guestName = `${firstName.value.trim()} ${lastName.value.trim()}`.trim()

    const rooms: HotelCartAddRoom[] = props.selectedRooms.map(r => ({
      adults: r.adults,
      children: r.children,
      price: r.price,
      price_with_offer: r.price_with_offer,
      number: r.number,
      id: r.id,
      number_selected: r.number_selected || 1,
      extra_person_count: r.extra_person_count,
      extra_person_price: r.extra_person_price,
      title: r.title,
      userInfo: {
        name: guestName,
        national_code: nationalCode.value,
      },
      tmp_dates: r.tmp_dates,
      is_customer: true,
    }))

    const payload: HotelCartAddPayload = {
      service_type: 'hotel',
      service_id: props.hotelId,
      service: {},
      userInfo: {
        first_name: firstName.value.trim(),
        last_name: lastName.value.trim(),
        mobile: mobile.value,
        gender: gender.value,
        national_code: nationalCode.value,
        email: email.value.trim(),
      },
      term_accepted: termsAccepted.value,
      night_count: props.nightCount,
      max_offer_percent: 0,
      start_date: props.startDate,
      end_date: props.endDate,
      date: [props.startDate, props.endDate],
      display_date: displayDate.value,
      rooms,
      adults: totalAdults.value,
      children: totalChildren.value,
      is_changed: false,
      total_price_display: formatPrice(totalPriceRial.value),
      total_price: totalPriceRial.value,
      total_price_with_offer_display: formatPrice(totalPriceWithOfferRial.value),
      total_price_with_offer: totalPriceWithOfferRial.value,
    }

    const { data, error } = await createBooking(payload)

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
        <button type="button" @click="emit('back')" class="btn btn-ghost btn-secondary">
          <ArrowRight class="size-5" />
          <span>بازگشت به انتخاب اتاق</span>
        </button>
        <div class="flex items-center gap-4 flex-wrap">
          <div class="bg-base-200 px-3 py-1.5 rounded-lg border border-base-300">
            <span class="text-sm font-mono tracking-wider">{{ displayDate }}</span>
          </div>
          <div class="font-bold text-lg">{{ hotelTitle }}</div>
        </div>
      </div>

      <div class="flex flex-col gap-3 mb-6">
        <div
          v-for="room in selectedRooms"
          :key="room.id"
          class="flex items-center justify-between gap-3 bg-base-200/50 p-3 rounded-xl">
          <div class="flex items-center gap-2">
            <BedDouble :size="16" class="text-primary shrink-0" />
            <span class="text-sm font-medium">{{ room.title }}</span>
          </div>
          <div class="flex items-center gap-3 text-xs text-base-content/60 shrink-0">
            <span class="flex items-center gap-1">
              <Users :size="12" />
              {{ room.adults.toLocaleString('fa-IR') }}
            </span>
            <span class="flex items-center gap-1">
              <Baby :size="12" />
              {{ room.children.toLocaleString('fa-IR') }}
            </span>
            <span class="font-bold text-primary">{{ formatPrice(room.price_with_offer) }}</span>
          </div>
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
            <label class="label" for="hotel-first-name">
              <span class="label-text">نام <span class="text-error">*</span></span>
            </label>
            <input
              id="hotel-first-name"
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
            <label class="label" for="hotel-last-name">
              <span class="label-text">نام خانوادگی <span class="text-error">*</span></span>
            </label>
            <input
              id="hotel-last-name"
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
            <label class="label" for="hotel-national-code">
              <span class="label-text">کدملی <span class="text-error">*</span></span>
            </label>
            <input
              id="hotel-national-code"
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
            <label class="label" for="hotel-mobile">
              <span class="label-text">شماره موبایل <span class="text-error">*</span></span>
            </label>
            <input
              id="hotel-mobile"
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

          <div class="form-control w-full">
            <label class="label" for="hotel-email">
              <span class="label-text">ایمیل <span class="text-error">*</span></span>
            </label>
            <input
              id="hotel-email"
              v-model="email"
              type="email"
              name="email"
              autocomplete="email"
              placeholder="example@mail.com"
              dir="ltr"
              :disabled="isSelf && isAuthenticated && !!user?.email"
              class="input w-full text-left"
              :class="{ 'input-error': touched && errors.email }"
            />
            <span v-if="touched && errors.email" class="text-error text-xs mt-1">{{ errors.email }}</span>
          </div>

          <div class="form-control w-full">
            <label class="label" for="hotel-gender">
              <span class="label-text">جنسیت <span class="text-error">*</span></span>
            </label>
            <select
              id="hotel-gender"
              v-model="gender"
              class="select w-full"
              :class="{ 'select-error': touched && errors.gender }">
              <option value="" disabled>انتخاب کنید</option>
              <option value="men">مرد</option>
              <option value="women">زن</option>
            </select>
            <span v-if="touched && errors.gender" class="text-error text-xs mt-1">{{ errors.gender }}</span>
          </div>
        </div>

        <div class="bg-base-200/50 p-4 rounded-xl mb-6 flex flex-col gap-2">
          <div v-if="totalPriceWithOfferRial < totalPriceRial" class="flex justify-between items-center text-sm">
            <span class="text-base-content/70">قیمت قبل از تخفیف:</span>
            <span class="text-base-content/40 line-through">{{ formatPrice(totalPriceRial) }}</span>
          </div>
          <div class="flex justify-between items-center pt-2 mt-1 border-t border-base-300">
            <span class="font-bold text-base-content/70">مبلغ قابل پرداخت:</span>
            <span class="font-bold text-lg text-primary">{{ formatPrice(totalPriceWithOfferRial) }}</span>
          </div>
        </div>

        <label class="flex items-start gap-2 mb-8 cursor-pointer">
          <input type="checkbox" v-model="termsAccepted" class="checkbox checkbox-sm mt-0.5" />
          <span class="text-xs sm:text-sm text-base-content/70">
            با تایید شما با قوانین و مقررات هتل و آسروتراول موافق هستید
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