// app/pages/cart/detail/index.vue
<script setup lang="ts">
import CartDetail from '~/components/cart/CartDetail.vue'
import CartSteps from '~/components/cart/CartSteps.vue'
import type { OpenHour } from '~/types/poolSingle.types'

interface CheckoutSlotState {
  selectedSlot: OpenHour
  genderCode: 'men' | 'women'
  serviceName: string
}

const checkoutSlotState = useState<CheckoutSlotState | null>('checkout-slot', () => null)

const selectedSlot = ref<OpenHour | null>(null)
const genderCode = ref<'men' | 'women'>('men')
const serviceName = ref('')

const router = useRouter()

const back = () => {
  router.back()
}

if (import.meta.client) {
  const { state } = window.history

  if (state?.selectedSlot) {
    selectedSlot.value = state.selectedSlot
    genderCode.value = state.genderCode || 'men'
    serviceName.value = state.serviceName || ''

    checkoutSlotState.value = {
      selectedSlot: state.selectedSlot,
      genderCode: state.genderCode || 'men',
      serviceName: state.serviceName || '',
    }
  } else if (checkoutSlotState.value) {
    selectedSlot.value = checkoutSlotState.value.selectedSlot
    genderCode.value = checkoutSlotState.value.genderCode
    serviceName.value = checkoutSlotState.value.serviceName
  } else {
    navigateTo('/')
  }
}
</script>

<template>
  <div class="container mx-auto p-4 md:p-8 mt-24">
    
    <CartSteps :current-step="1" />

    <ClientOnly>
      <CartDetail
        v-if="selectedSlot"
        :selected-slot="selectedSlot"
        :gender-code="genderCode"
        :service-name="serviceName"
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