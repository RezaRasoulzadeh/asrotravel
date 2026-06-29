// app/components/cart/CartSteps.vue
<script setup lang="ts">
import { CalendarDays, User, CreditCard, Receipt } from 'lucide-vue-next'

interface Props {
  currentStep: number
}

withDefaults(defineProps<Props>(), {
  currentStep: 1
})

const steps = [
  { label: 'انتخاب زمان', icon: CalendarDays },
  { label: 'ورود به حساب', icon: User },
  { label: 'پرداخت هزینه', icon: CreditCard },
  { label: 'دریافت رسید', icon: Receipt }
]
</script>

<template>
  <ul class="steps steps-horizontal w-full mb-10 text-sm font-medium">
    <li 
      v-for="(step, index) in steps" 
      :key="index"
      data-content=" " 
      class="step"
      :class="{ 'step-primary': index + 1 <= currentStep }"
    >
      <div 
        class="row-start-1 col-start-1 z-10 flex items-center justify-center w-8 h-8 pointer-events-none"
        :class="index + 1 <= currentStep ? 'text-primary-content' : 'text-base-content/40'"
      >
        <component :is="step.icon" :size="18" stroke-width="2" />
      </div>
      
      <span class="row-start-2 col-start-1 mt-1">{{ step.label }}</span>
    </li>
  </ul>
</template>