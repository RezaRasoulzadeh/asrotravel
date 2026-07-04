// app/pages/cart/vip-detail/index.vue
<script setup lang="ts">
import CartSteps from '~/components/cart/CartSteps.vue'
import VipCartDetail from '~/components/cart/VipCartDetail.vue'
import type { VipChangeDateSlot } from '~/types/poolSingle.types'
import type { VipParentInfo } from '~/types/cart.types'

interface VipCheckoutState {
  selectedSlot: VipChangeDateSlot
  serviceId: number
  serviceName: string
  genderCode: 'men' | 'women' | 'any'
  guestCapacity: number
  parent: VipParentInfo
}

const checkoutSlotState = useState<VipCheckoutState | null>('vip-checkout-slot', () => null)

const selectedSlot = ref<VipChangeDateSlot | null>(null)
const serviceId = ref(0)
const serviceName = ref('')
const genderCode = ref<'men' | 'women' | 'any'>('any')
const guestCapacity = ref(6)
const parent = ref<VipParentInfo>({ title: '', slug: '' })

const router = useRouter()

const back = () => {
  router.back()
}

if (import.meta.client) {
  const { state } = window.history

  if (state?.selectedSlot) {
    selectedSlot.value = state.selectedSlot
    serviceId.value = state.serviceId || 0
    serviceName.value = state.serviceName || ''
    genderCode.value = state.genderCode || 'any'
    guestCapacity.value = state.guestCapacity || 6
    parent.value = state.parent || { title: '', slug: '' }

    checkoutSlotState.value = {
      selectedSlot: state.selectedSlot,
      serviceId: state.serviceId || 0,
      serviceName: state.serviceName || '',
      genderCode: state.genderCode || 'any',
      guestCapacity: state.guestCapacity || 6,
      parent: state.parent || { title: '', slug: '' }
    }
  } else if (checkoutSlotState.value) {
    selectedSlot.value = checkoutSlotState.value.selectedSlot
    serviceId.value = checkoutSlotState.value.serviceId
    serviceName.value = checkoutSlotState.value.serviceName
    genderCode.value = checkoutSlotState.value.genderCode
    guestCapacity.value = checkoutSlotState.value.guestCapacity
    parent.value = checkoutSlotState.value.parent
  } else {
    navigateTo('/')
  }
}
</script>

<template>
  <div class="container mx-auto p-4 md:p-8 mt-24">
    <CartSteps :current-step="1" />
    <ClientOnly>
      <VipCartDetail
        v-if="selectedSlot"
        :selected-slot="selectedSlot"
        :service-id="serviceId"
        :service-name="serviceName"
        :gender-code="genderCode"
        :guest-capacity="guestCapacity"
        :parent="parent"
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