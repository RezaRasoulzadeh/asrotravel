// components/cart/HotelCartDetail.vue
<script setup lang="ts">
import { ArrowRight, ChevronLeft, BedDouble, Users, Baby, Plus, Minus, Trash2, UserRound, SearchX } from 'lucide-vue-next'
import type { HotelRoom } from '~/types/hotelSingle.types'
import type { HotelCartAddPayload, HotelCartAddRoom, HotelCheckoutSummaryState, HotelRoomGuest, HotelRoomSelection } from '~/types/cart.types'
import { formatPrice } from '~/utils/price'

interface Props {
  hotelId: number
  hotelTitle: string
  hotelSlug: string
  startDate: string
  endDate: string
  nightCount: number
  allRooms: HotelRoom[]
  selections: HotelRoomSelection[]
}

const props = defineProps<Props>()
const emit = defineEmits(['back'])

function makeGuestId(): string {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
}

// local, editable copy of the room cart — quantities & guest forms can still change here before checkout
const localSelections = ref<HotelRoomSelection[]>(
  JSON.parse(JSON.stringify(props.selections)) as HotelRoomSelection[],
)

watch(() => localSelections.value.length, (newLen, oldLen) => {
  if (oldLen > 0 && newLen === 0) {
    useToast().error('همه اتاق‌های انتخابی حذف شدند، لطفا حداقل یک اتاق انتخاب کنید')
  }
})

function quantityOf(roomId: number): number {
  return localSelections.value.find(s => s.room.id === roomId)?.guests.length ?? 0
}

function addRoomUnit(room: HotelRoom) {
  if (room.number < 1) return
  const existing = localSelections.value.find(s => s.room.id === room.id)
  const qty = existing?.guests.length ?? 0
  if (qty >= room.number) return

  const guest: HotelRoomGuest = { localId: makeGuestId(), name: '', nationalCode: '', guestCount: 1, isSupervisor: false }
  if (existing) {
    existing.guests.push(guest)
  } else {
    localSelections.value.push({ room, guests: [guest] })
  }
}

function removeRoomUnit(roomId: number) {
  const entry = localSelections.value.find(s => s.room.id === roomId)
  if (!entry) return
  if (entry.guests.length <= 1) {
    localSelections.value = localSelections.value.filter(s => s.room.id !== roomId)
  } else {
    entry.guests.pop()
  }
}

function removeGuest(roomId: number, guestLocalId: string) {
  const entry = localSelections.value.find(s => s.room.id === roomId)
  if (!entry) return
  entry.guests = entry.guests.filter(g => g.localId !== guestLocalId)
  if (!entry.guests.length) {
    localSelections.value = localSelections.value.filter(s => s.room.id !== roomId)
  }
}

function removeRoomType(roomId: number) {
  localSelections.value = localSelections.value.filter(s => s.room.id !== roomId)
}

// rooms from this hotel not yet added (or with remaining capacity), offered via the "add another room" picker
const addableRooms = computed(() =>
  props.allRooms.filter((r) => {
    if (r.number < 1) return false
    return quantityOf(r.id) < r.number
  }),
)

const roomToAdd = ref<number | ''>('')
function handleAddAnotherRoom() {
  const room = props.allRooms.find(r => r.id === roomToAdd.value)
  if (!room) return
  addRoomUnit(room)
  roomToAdd.value = ''
}

// flattened, globally-numbered guest forms — "اتاق ۱: <title>", "اتاق ۲: <title>", ...
const guestEntries = computed(() => {
  let n = 0
  return localSelections.value.flatMap(selection =>
    selection.guests.map((guest) => {
      n += 1
      return { index: n, room: selection.room, guest }
    }),
  )
})

function isValidGuestNationalCode(code: string): boolean {
  if (!/^\d{10}$/.test(code)) return false
  if (/^(\d)\1{9}$/.test(code)) return false
  const check = Number(code[9])
  const sum = Array.from({ length: 9 }, (_, i) => Number(code[i]) * (10 - i)).reduce((a, b) => a + b, 0)
  const remainder = sum % 11
  return remainder < 2 ? check === remainder : check === 11 - remainder
}

function onGuestNationalCodeInput(guest: HotelRoomGuest, e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/[۰-۹]/g, d => String(d.charCodeAt(0) - 0x06F0)).replace(/\D/g, '')
  guest.nationalCode = raw.slice(0, 10)
}

function baseCapacity(room: HotelRoom): number {
  return room.adults + room.children
}

function maxCapacity(room: HotelRoom): number {
  return baseCapacity(room) + (room.extra_person ? room.extra_person_count : 0)
}

function increaseGuestCount(guest: HotelRoomGuest, room: HotelRoom) {
  if (guest.guestCount < maxCapacity(room)) guest.guestCount += 1
}

function decreaseGuestCount(guest: HotelRoomGuest) {
  if (guest.guestCount > 1) guest.guestCount -= 1
}

function extraGuestCount(guest: HotelRoomGuest, room: HotelRoom): number {
  return Math.max(0, guest.guestCount - baseCapacity(room))
}

const guestsTouched = ref(false)

const guestsValid = computed(() =>
  guestEntries.value.every(({ guest }) =>
    guest.name.trim().length > 0 && isValidGuestNationalCode(guest.nationalCode) && guest.guestCount >= 1,
  ),
)

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
const fullName = computed(() => `${firstName.value.trim()} ${lastName.value.trim()}`.trim())

function applySupervisorInfoToGuest(guest: HotelRoomGuest) {
  guest.name = fullName.value
  guest.nationalCode = nationalCode.value
}

function handleGuestSupervisorToggle(guest: HotelRoomGuest) {
  if (guest.isSupervisor) {
    applySupervisorInfoToGuest(guest)
  } else {
    guest.name = ''
    guest.nationalCode = ''
  }
}

watch([firstName, lastName, nationalCode], () => {
  for (const { guest } of guestEntries.value) {
    if (guest.isSupervisor) applySupervisorInfoToGuest(guest)
  }
})
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
  email: !email.value.trim() || isValidEmail(email.value) ? '' : 'ایمیل وارد شده معتبر نیست',
  gender: '',
}))

const isFormValid = computed(() =>
  !errors.value.firstName &&
  !errors.value.lastName &&
  !errors.value.nationalCode &&
  !errors.value.mobile &&
  !errors.value.email &&
  termsAccepted.value &&
  guestsValid.value &&
  guestEntries.value.length > 0
)

const totalExtraPersonRial = computed(() =>
  guestEntries.value.reduce(
    (sum, { guest, room }) => sum + extraGuestCount(guest, room) * (room.extra_person_price || 0) * props.nightCount,
    0,
  )
)

const totalBeforeDiscount = computed(() =>
  localSelections.value.reduce((sum, s) => sum + (s.room.price || 0) * s.guests.length, 0) + totalExtraPersonRial.value
)

const total = computed(() =>
  localSelections.value.reduce((sum, s) => sum + (s.room.price_with_offer || 0) * s.guests.length, 0) + totalExtraPersonRial.value
)

// each room instance's occupancy comes from its own guest form (تعداد نفرات), capped by the room's own capacity
const totalGuestsCount = computed(() =>
  guestEntries.value.reduce((sum, { guest }) => sum + (guest.guestCount || 0), 0)
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

// overwrites the display-only summary snapshot with what's actually being submitted right now,
// since hotel/[slug].vue only wrote it once before the user could still add/remove rooms here
function syncCheckoutSummaryState() {
  const summaryState: HotelCheckoutSummaryState = {
    hotelTitle: props.hotelTitle,
    startDate: props.startDate,
    endDate: props.endDate,
    nightCount: props.nightCount,
    rooms: localSelections.value.map(s => ({
      title: s.room.title,
      numberSelected: s.guests.length,
      priceWithOffer: s.room.price_with_offer,
      price: s.room.price,
    })),
    extraPersonTotal: totalExtraPersonRial.value,
  }
  useState<HotelCheckoutSummaryState | null>('hotel-checkout-summary', () => null).value = summaryState
}

const checkout = async () => {
  touched.value = true
  guestsTouched.value = true

  if (!isFormValid.value) {
    if (errors.value.firstName || errors.value.lastName || errors.value.nationalCode || errors.value.mobile || errors.value.email) {
      useToast().error('لطفا اطلاعات رزروکننده را کامل و صحیح وارد کنید')
    } else if (!guestsValid.value) {
      useToast().error('لطفا اطلاعات مهمانان هر اتاق را کامل و صحیح وارد کنید')
    } else if (!termsAccepted.value) {
      useToast().error('لطفا قوانین و مقررات را تایید کنید')
    }
    return
  }

  if (submitting.value) return

  if (!props.hotelId || !guestEntries.value.length) {
    useToast().error('اطلاعات این رزرو ناقص است، لطفا دوباره اتاق مورد نظر را انتخاب کنید')
    return
  }

  submitting.value = true

  try {
    const rooms: HotelCartAddRoom[] = guestEntries.value.map(({ room, guest }) => ({
      adults: guest.guestCount,
      children: 0,
      price: room.price,
      price_with_offer: room.price_with_offer,
      number: room.number,
      id: room.id,
      number_selected: 1,
      extra_person_count: room.extra_person_count,
      extra_person_price: room.extra_person_price,
      title: room.title,
      userInfo: {
        name: guest.name.trim(),
        national_code: guest.nationalCode,
      },
      tmp_dates: room.tmp_dates,
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
      adults: totalGuestsCount.value,
      children: 0,
      is_changed: false,
      total_price_display: formatPrice(totalBeforeDiscount.value),
      total_price: totalBeforeDiscount.value,
      total_price_with_offer_display: formatPrice(total.value),
      total_price_with_offer: total.value,
    }

    const { data, error } = await createBooking(payload)

    if (error) return
    if (!data?.booking_code) {
      useToast().error('خطا در ثبت رزرو، لطفا دوباره تلاش کنید')
      return
    }
    syncCheckoutSummaryState()
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
              <span class="label-text">ایمیل <span class="text-base-content/40 text-xs">(اختیاری)</span></span>
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
              <span class="label-text">جنسیت <span class="text-base-content/40 text-xs">(اختیاری)</span></span>
            </label>
            <select
              id="hotel-gender"
              v-model="gender"
              class="select w-full">
              <option value="">انتخاب کنید</option>
              <option value="men">مرد</option>
              <option value="women">زن</option>
            </select>
          </div>
        </div>

        <div v-if="localSelections.length" class="flex flex-col gap-3 mb-4">
          <div
            v-for="selection in localSelections"
            :key="selection.room.id"
            class="flex items-center justify-between gap-3 bg-base-200/50 p-3 rounded-xl flex-wrap">
            <div class="flex items-center gap-2">
              <BedDouble :size="16" class="text-primary shrink-0" />
              <span class="text-sm font-medium">{{ selection.room.title }}</span>
            </div>
            <div class="flex items-center gap-3 text-xs text-base-content/60 shrink-0">
              <span class="flex items-center gap-1">
                <Users :size="12" />
                {{ selection.room.adults.toLocaleString('fa-IR') }}
              </span>
              <span class="flex items-center gap-1">
                <Baby :size="12" />
                {{ selection.room.children.toLocaleString('fa-IR') }}
              </span>
              <span class="font-bold text-primary">{{ formatPrice(selection.room.price_with_offer) }}</span>
  
              <button
                type="button"
                class="btn btn-xs btn-circle btn-ghost text-error"
                aria-label="حذف این نوع اتاق"
                @click="removeRoomType(selection.room.id)">
                <Trash2 :size="14" />
              </button>
              <button
                type="button"
                class="btn btn-xs btn-circle btn-outline"
                aria-label="کاهش تعداد"
                @click="removeRoomUnit(selection.room.id)">
                <Minus :size="14" />
              </button>
              <span class="font-bold min-w-4 text-center">{{ selection.guests.length.toLocaleString('fa-IR') }}</span>
              <button
                type="button"
                class="btn btn-xs btn-circle btn-outline"
                aria-label="افزودن اتاق دیگر از همین نوع"
                :disabled="quantityOf(selection.room.id) >= selection.room.number"
                @click="addRoomUnit(selection.room)">
                <Plus :size="14" />
              </button>
            </div>
          </div>
  
          <div v-if="addableRooms.length" class="flex items-center gap-2 flex-wrap">
            <select v-model="roomToAdd" class="select select-sm w-full sm:w-auto sm:min-w-64">
              <option value="" disabled>افزودن نوع اتاق دیگر...</option>
              <option v-for="r in addableRooms" :key="r.id" :value="r.id">{{ r.title }}</option>
            </select>
            <button
              type="button"
              class="btn btn-sm btn-outline btn-primary gap-1"
              :disabled="!roomToAdd"
              @click="handleAddAnotherRoom">
              <Plus :size="14" />
              افزودن اتاق
            </button>
          </div>
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center py-16 gap-3 text-center px-4 mb-4 border border-dashed border-base-300 rounded-2xl">
          <span class="bg-base-200 rounded-full p-4 text-base-content/30">
            <SearchX :size="28" />
          </span>
          <p class="text-base-content/50 text-sm">همه اتاق‌های انتخابی حذف شدند</p>
          <button type="button" class="btn btn-sm btn-primary btn-soft" @click="emit('back')">
            بازگشت به انتخاب اتاق
          </button>
        </div>

        <div v-if="guestEntries.length" class="flex flex-col gap-4 mb-6">
          <div
            v-for="{ index, room, guest } in guestEntries"
            :key="guest.localId"
            class="bg-base-200/40 border border-base-300 rounded-2xl p-4">
            <div class="flex items-center justify-between gap-2 mb-3">
              <div class="flex items-center gap-2">
                <UserRound :size="16" class="text-primary shrink-0" />
                <span class="font-bold text-sm">اتاق {{ index.toLocaleString('fa-IR') }}: {{ room.title }}</span>
              </div>
              <button
                type="button"
                class="btn btn-xs btn-circle btn-ghost text-error"
                aria-label="حذف این اتاق"
                @click="removeGuest(room.id, guest.localId)">
                <Trash2 :size="14" />
              </button>
            </div>
            <label class="flex items-center gap-3 mb-3 cursor-pointer w-fit">
              <input
                type="checkbox"
                v-model="guest.isSupervisor"
                class="toggle toggle-primary toggle-sm"
                @change="handleGuestSupervisorToggle(guest)"
              />
              <span class="text-xs text-base-content/70">سرپرست این اتاق خودم هستم</span>
            </label>
  
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div class="form-control w-full">
                <label class="label" :for="`guest-name-${guest.localId}`">
                  <span class="label-text text-xs">نام و نام خانوادگی <span class="text-error">*</span></span>
                </label>
                <input
                  :id="`guest-name-${guest.localId}`"
                  v-model="guest.name"
                  type="text"
                  placeholder="نام و نام خانوادگی"
                  :disabled="guest.isSupervisor"
                  class="input input-sm w-full h-10"
                  :class="{ 'input-error': guestsTouched && !guest.name.trim() }"
                />
                <span v-if="guestsTouched && !guest.name.trim()" class="text-error text-xs mt-1">
                  لطفا نام و نام خانوادگی مهمان را وارد کنید
                </span>
              </div>
  
              <div class="form-control w-full">
                <label class="label" :for="`guest-code-${guest.localId}`">
                  <span class="label-text text-xs">کدملی <span class="text-error">*</span></span>
                </label>
                <input
                  :id="`guest-code-${guest.localId}`"
                  :value="guest.nationalCode"
                  @input="onGuestNationalCodeInput(guest, $event)"
                  type="text"
                  inputmode="numeric"
                  placeholder="کدملی"
                  :disabled="guest.isSupervisor"
                  class="input input-sm w-full h-10"
                  :class="{ 'input-error': guestsTouched && !isValidGuestNationalCode(guest.nationalCode) }"
                />
                <span v-if="guestsTouched && !isValidGuestNationalCode(guest.nationalCode)" class="text-error text-xs mt-1">
                  کدملی وارد شده معتبر نیست
                </span>
              </div>
  
              <div class="form-control w-full">
                <label class="label">
                  <span class="label-text text-xs">تعداد نفرات <span class="text-error">*</span></span>
                </label>
                <div class="input input-sm w-full h-10 flex items-center justify-between px-2">
                  <button
                    type="button"
                    @click="decreaseGuestCount(guest)"
                    :disabled="guest.guestCount <= 1"
                    class="btn btn-xs btn-ghost btn-square -ms-2">
                    <Minus :size="14" />
                  </button>
                  <span class="font-mono font-bold text-sm">{{ guest.guestCount }}</span>
                  <button
                    type="button"
                    @click="increaseGuestCount(guest, room)"
                    :disabled="guest.guestCount >= maxCapacity(room)"
                    class="btn btn-xs btn-ghost btn-square -me-2">
                    <Plus :size="14" />
                  </button>
                </div>
                <span v-if="extraGuestCount(guest, room) > 0" class="text-xs text-warning mt-1">
                  {{ extraGuestCount(guest, room).toLocaleString('fa-IR') }} نفر اضافه × {{ formatPrice(room.extra_person_price) }} در شب
                </span>
              </div>
            </div>
          </div>
        </div>
  
        <div class="bg-base-200/50 p-4 rounded-xl mb-6 flex flex-col gap-2">
          <div v-if="total < totalBeforeDiscount" class="flex justify-between items-center text-sm">
            <span class="text-base-content/70">قیمت قبل از تخفیف:</span>
            <span class="text-base-content/40 line-through">{{ formatPrice(totalBeforeDiscount) }}</span>
          </div>
          <div v-if="totalExtraPersonRial > 0" class="flex justify-between items-center text-sm">
            <span class="text-base-content/70">هزینه نفرات اضافه:</span>
            <span class="font-medium">{{ formatPrice(totalExtraPersonRial) }}</span>
          </div>
          <div class="flex justify-between items-center pt-2 mt-1 border-t border-base-300">
            <span class="font-bold text-base-content/70">مبلغ قابل پرداخت:</span>
            <span class="font-bold text-lg text-primary">{{ formatPrice(total) }}</span>
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