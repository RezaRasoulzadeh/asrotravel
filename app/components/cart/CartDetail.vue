// app/components/cart/CartDetail.vue
<script setup lang="ts">
import { ArrowLeft, ArrowRight, ChevronLeft, Minus, Plus } from 'lucide-vue-next'
import type { OpenHour } from '~/types/poolSingle.types'
import { formatPrice } from '~/utils/price'

interface Props {
    selectedSlot: OpenHour
    genderCode: 'men' | 'women'
    serviceName: string
}

const props = defineProps<Props>()
const emit = defineEmits(['back'])

const quantity = ref(1)

const pricePerUnitRial = computed(() => props.selectedSlot.adult_price_with_offer)
const originPricePerUnitRial = computed(() => Number(props.selectedSlot.adult_price))
const offerAmountRial = computed(() => Number(props.selectedSlot.offer))

const offerPercent = computed(() => {
    if (originPricePerUnitRial.value <= 0) return 0
    return Math.ceil((offerAmountRial.value / originPricePerUnitRial.value) * 100)
})

const totalPriceRial = computed(() => pricePerUnitRial.value * quantity.value)
const totalOriginPriceRial = computed(() => originPricePerUnitRial.value * quantity.value)
const totalSavingsRial = computed(() => totalOriginPriceRial.value - totalPriceRial.value)

const maxCapacity = computed(() => props.selectedSlot.number || 10)

const increase = () => {
    if (quantity.value < maxCapacity.value) {
        quantity.value++
    }
}

const decrease = () => {
    if (quantity.value > 1) {
        quantity.value--
    }
}
</script>

<template>
    <div dir="rtl" class="w-full">
        <div class="bg-base-100 rounded-3xl border border-base-300 p-6 md:p-8 shadow-sm">
            <div
                class="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-base-300 mb-6 gap-4">
                <button @click="emit('back')" class="btn btn-ghost btn-secondary">
                    <ArrowRight class="size-5" />
                    <span>بازگشت به انتخاب زمان</span>
                </button>
                <div class="flex items-center gap-4">
                    <div class="bg-base-200 px-3 py-1.5 rounded-lg border border-base-300">
                        <span class="text-sm font-mono tracking-wider" ">{{ selectedSlot.time_display }}</span>
                    </div>
                    <div class=" font-bold text-lg">{{ selectedSlot.day }} - {{ selectedSlot.date }}
                    </div>
                    <div class="badge badge-neutral">{{ serviceName }}</div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                <div class="flex justify-between items-center bg-base-200/50 p-4 rounded-xl">
                    <span class="text-base-content/70">قیمت بلیت:</span>
                    <span class="font-bold">{{ selectedSlot.display_price_object?.price_with_offer_display ||
                        selectedSlot.price_with_offer_display }}</span>
                </div>

                <div class="flex justify-between items-center bg-base-200/50 p-4 rounded-xl">
                    <span class="text-base-content/70">تعداد بلیت:</span>
                    <div class="flex items-center gap-3 bg-base-100 rounded-lg p-1 border border-base-300 shadow-sm">
                        <button @click="increase" :disabled="quantity >= maxCapacity"
                            class="btn btn-sm btn-ghost btn-square">
                            <Plus :size="16" />
                        </button>
                        <span class="w-8 text-center font-mono font-bold">{{ quantity }}</span>
                        <button @click="decrease" :disabled="quantity <= 1" class="btn btn-sm btn-ghost btn-square">
                            <Minus :size="16" />
                        </button>

                    </div>
                </div>

                <div class="col-span-full border-t border-base-300/60 my-2" />

                <div class="flex justify-between items-center px-2">
                    <span class="text-base-content/70">سود شما از این رزرو:</span>
                    <div class="flex items-center gap-2">
                        <span v-if="offerPercent > 0" class="badge badge-error badge-sm text-white font-mono">{{
                            offerPercent }}%</span>
                        <span class="text-error font-bold" ">{{ formatPrice(totalSavingsRial) }}</span>
                    </div>
                </div>

                <div class=" flex justify-between items-center px-2">
                            <span class="text-base-content/70">مبلغ کل:</span>
                            <span class="font-bold text-xl" ">{{ formatPrice(totalPriceRial) }}</span>
                </div>
            </div>

            <div
                class=" mt-8 pt-6 border-t border-base-300 flex flex-col sm:flex-row justify-between items-center
                                gap-6">
                                <div class="flex flex-col text-center sm:text-right w-full sm:w-auto">
                                    <span class="text-base-content/70 text-sm mb-1">مبلغ قابل پرداخت</span>
                                    <span class="text-3xl font-extrabold text-primary" ">
                        {{ formatPrice(totalPriceRial).replace(' تومان', '') }}
                        <span class=" text-lg font-medium text-base-content/70">تومان</span>
                            </span>
                    </div>
                    <button class="group btn btn-primary btn-lg w-full sm:w-48 text-base gap-0">
                        <span class="pt-0.5">تکمیل خرید</span>
                        <ChevronLeft class="size-6 transition-transform duration-200 group-hover:-translate-x-2" />
                    </button>
                </div>
            </div>
        </div>
</template>