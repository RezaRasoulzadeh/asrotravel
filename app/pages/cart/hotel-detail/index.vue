// app/pages/cart/hotel-detail/index.vue
<script setup lang="ts">
import CartSteps from '~/components/cart/CartSteps.vue'
import HotelCartDetail from '~/components/cart/HotelCartDetail.vue'
import type { HotelCheckoutSlotState } from '~/types/cart.types'

const checkoutSlotState = useState<HotelCheckoutSlotState | null>('hotel-checkout-slot', () => null)

const hotelId = ref(0)
const hotelTitle = ref('')
const hotelSlug = ref('')
const startDate = ref('')
const endDate = ref('')
const nightCount = ref(1)
const selectedRooms = ref<HotelCheckoutSlotState['selectedRooms']>([])

const router = useRouter()

const back = () => {
  router.back()
}

if (import.meta.client) {
  if (checkoutSlotState.value?.selectedRooms?.length) {
    hotelId.value = checkoutSlotState.value.hotelId
    hotelTitle.value = checkoutSlotState.value.hotelTitle
    hotelSlug.value = checkoutSlotState.value.hotelSlug
    startDate.value = checkoutSlotState.value.startDate
    endDate.value = checkoutSlotState.value.endDate
    nightCount.value = checkoutSlotState.value.nightCount
    selectedRooms.value = checkoutSlotState.value.selectedRooms
  } else {
    navigateTo('/')
  }
}
</script>

<template>
  <div class="container mx-auto p-4 md:p-8 mt-24">
    <CartSteps :current-step="1" />
    <ClientOnly>
      <HotelCartDetail
        v-if="selectedRooms.length"
        :hotel-id="hotelId"
        :hotel-title="hotelTitle"
        :hotel-slug="hotelSlug"
        :start-date="startDate"
        :end-date="endDate"
        :night-count="nightCount"
        :selected-rooms="selectedRooms"
        @back="back"
      />
      <template #fallback>
        <div class="flex justify-center p-12">
          <span class="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </template>
    </ClientOnly>
  </div>
</template>