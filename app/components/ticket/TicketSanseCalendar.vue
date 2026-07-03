// components/ticket/TicketSanseCalendar.vue
<script setup lang="ts">
import { ShoppingCart, CheckCircle, Ban, Ticket } from 'lucide-vue-next'
import type { TicketSanse, TicketServiceItem } from '~/types/ticketSingle.types'

const props = defineProps<{
  services?: TicketSanse['services'] | null
  ticketSlug: string
  serviceActive?: boolean
  modelValue?: number | string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [id: number | string | null]
  'add-to-cart': [ticket: TicketServiceItem & { genderLabel: string }]
}>()

const activeGender = ref<string>('')

const selectedId = computed({
  get: () => props.modelValue ?? null,
  set: (v) => emit('update:modelValue', v),
})

const sectionsByCategory = computed(() => {
  const map = new Map<string, { genderLabel: string; items: TicketServiceItem[] }[]>()
  const ticket = props.services?.ticket

  if (!ticket || typeof ticket !== 'object') return map

  for (const [categoryName, categoryArr] of Object.entries(ticket)) {
    if (!Array.isArray(categoryArr)) continue

    const categorySections = []
    for (const genderObj of categoryArr) {
      if (!genderObj || typeof genderObj !== 'object') continue

      for (const [genderKey, items] of Object.entries(genderObj)) {
        if (!activeGender.value) activeGender.value = genderKey

        if (!Array.isArray(items)) continue

        categorySections.push({
          genderLabel: genderKey,
          items,
        })
      }
    }
    map.set(categoryName, categorySections)
  }
  return map
})

const availableTabs = computed(() => {
  const tabs = new Set<string>()
  for (const sections of sectionsByCategory.value.values()) {
    for (const section of sections) {
      tabs.add(section.genderLabel)
    }
  }
  return Array.from(tabs)
})

function hasOffer(item: TicketServiceItem): boolean {
  return Number(item.offer_percent ?? 0) > 0
}

function hasChildPrice(item: TicketServiceItem): boolean {
  return (
    item.service_features?.child_price_display != null &&
    item.service_features.child_price_display !== '0'
  )
}

function isBookable(item: TicketServiceItem): boolean {
  return props.serviceActive && !!item.status
}

function selectItem(item: TicketServiceItem, genderLabel: string) {
  if (!isBookable(item)) return
  if (selectedId.value === item.id) {
    selectedId.value = null
    return
  }
  selectedId.value = item.id
  emit('add-to-cart', { ...item, genderLabel })
}

function handleBuy(item: TicketServiceItem, genderLabel: string) {
  if (!isBookable(item)) return

  navigateTo({
    path: '/cart/detail',
    state: {
      selectedItem: { ...item, slug: props.ticketSlug },
      genderLabel
    } as any
  })
}
</script>

<template>
  <div dir="rtl" class="mt-8 flex flex-col gap-8" id="tickets-section">
    <div v-if="!serviceActive"
      class="flex items-center gap-2 rounded-2xl bg-error/10 border border-error/30 px-4 py-3 text-error text-sm font-medium">
      <Ban :size="16" class="shrink-0" />
      <span>این سرویس در حال حاضر فعال نیست و امکان خرید بلیت وجود ندارد.</span>
    </div>

    <template v-for="[categoryName, sections] in sectionsByCategory" :key="categoryName">
      <div class="flex items-center gap-3">
        <span class="h-px flex-1 bg-base-300/60" />
        <h3 class="text-sm font-bold text-base-content/60 px-2">{{ categoryName }}</h3>
        <span class="h-px flex-1 bg-base-300/60" />
      </div>

      <div v-if="availableTabs.length > 1" class="flex lg:hidden bg-base-200 p-1 rounded-xl w-full relative isolation-auto">
        <button v-for="tab in availableTabs" :key="tab" type="button"
          class="flex-1 py-2.5 text-center text-sm font-bold rounded-lg transition-all duration-300 z-10"
          :class="activeGender === tab ? 'text-primary-content font-extrabold' : 'text-base-content/70'"
          @click="activeGender = tab">
          {{ tab }}
        </button>
        <div
          class="absolute top-1 bottom-1 w-[calc(100%/var(--tab-count))] rounded-lg bg-primary transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] z-0"
          :style="{ 
            '--tab-count': availableTabs.length,
            transform: `translateX(${availableTabs.indexOf(activeGender) * 100}%)`,
            right: '4px'
          }" />
      </div>

      <div class="block lg:hidden overflow-hidden relative w-full">
        <template v-for="section in sections" :key="'mob-' + section.genderLabel">
          <Transition enter-active-class="transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            leave-active-class="transition duration-200 ease-in absolute top-0 left-0 w-full"
            enter-from-class="opacity-0 translate-y-4" leave-to-class="opacity-0 -translate-y-4">
            <div v-if="activeGender === section.genderLabel"
              class="rounded-2xl border border-base-300/60 w-full bg-base-100"
              :class="{ 'opacity-60': !serviceActive }">
              
              <div class="w-full text-sm flex flex-col">
                <div class="flex flex-col w-full">
                  <div v-for="item in section.items" :key="item.id"
                    class="border-b last:border-b-0 border-base-300/30 transition-colors flex flex-col p-4 w-full gap-y-4"
                    :class="{
                      'opacity-40 bg-base-200/50': !item.status,
                      'bg-primary/5': selectedId === item.id,
                      'hover:bg-base-200/40 cursor-pointer': isBookable(item),
                      'cursor-not-allowed': !isBookable(item),
                    }" @click="selectItem(item, section.genderLabel)">
                    
                    <div class="flex items-start justify-between w-full">
                      <div class="flex flex-col gap-1 text-right">
                        <span class="font-bold text-base-content text-base flex items-center gap-1.5">
                          <Ticket class="size-4 text-primary" />
                          {{ item.service_features?.name || 'بلیت' }}
                        </span>
                        <span class="text-xs text-base-content/50">{{ item.service_features?.desc || 'بدون توضیحات' }}</span>
                      </div>
                      
                      <div class="flex flex-col text-left">
                        <template v-if="item.status">
                          <del v-if="hasOffer(item)" class="text-xs text-base-content/40 block">
                            {{ item.service_features?.display_price_object?.origin_price_display }}
                          </del>
                          <span class="font-black text-primary text-base">
                            {{ item.service_features?.display_price_object?.price_with_offer_display }}
                          </span>
                          <span v-if="hasChildPrice(item)" class="block text-xs text-base-content/50 mt-0.5">
                            کودک: {{ item.service_features?.child_price_display }}
                          </span>
                        </template>
                        <span v-else class="text-xs text-error font-bold mt-1">ناموجود</span>
                      </div>
                    </div>

                    <div class="w-full" @click.stop>
                      <button v-if="!serviceActive"
                        class="btn btn-ghost btn-dash text-base-content/30 w-full cursor-not-allowed" disabled>
                        <Ban :size="12" /> قابل خرید نیست
                      </button>
                      <button v-else-if="!item.status"
                        class="btn btn-ghost btn-dash text-base-content/30 w-full cursor-not-allowed" disabled>
                        ناموجود
                      </button>
                      <button v-else-if="selectedId === item.id" class="btn w-full font-semibold btn-primary"
                        @click="selectItem(item, section.genderLabel)">
                        <CheckCircle :size="12" /> انتخاب شد
                      </button>
                      <button v-else class="btn w-full font-semibold btn-primary bg-primary/10 text-primary btn-dash"
                        @click="handleBuy(item, section.genderLabel)">
                        <ShoppingCart :size="12" /> خرید بلیت
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </template>
      </div>

      <div class="hidden lg:flex flex-row gap-4">
        <div v-for="section in sections" :key="'desk-' + section.genderLabel"
          class="flex-1 min-w-0 rounded-2xl overflow-hidden border border-base-300/60 w-full"
          :class="{ 'opacity-60': !serviceActive }">
          <div class="py-3 px-4 text-center font-bold text-base bg-base-200 border-b border-base-300/50">
            {{ section.genderLabel }}
          </div>

          <div class="w-full text-sm flex flex-col">
            <div class="grid grid-cols-3 bg-base-100 text-base-content/60 text-xs py-2.5 px-4 font-medium border-b border-base-300/30">
              <div class="text-right">نوع بلیت</div>
              <div class="text-center">قیمت</div>
              <div class="text-center">عملیات</div>
            </div>

            <div class="flex flex-col w-full bg-base-100">
              <div v-for="item in section.items" :key="item.id"
                class="border-b last:border-b-0 border-base-300/30 transition-colors grid grid-cols-3 items-center p-4 w-full"
                :class="{
                  'opacity-40 bg-base-200/50': !item.status,
                  'bg-primary/5': selectedId === item.id,
                  'hover:bg-base-200/40 cursor-pointer': isBookable(item),
                  'cursor-not-allowed': !isBookable(item),
                }" @click="selectItem(item, section.genderLabel)">
                
                <div class="text-right flex flex-col gap-1">
                  <span class="font-bold text-base-content flex items-center gap-1.5">
                    <Ticket class="size-4 text-primary" />
                    {{ item.service_features?.name || 'بلیت' }}
                  </span>
                  <span class="text-xs text-base-content/50 pr-5">{{ item.service_features?.desc || 'بدون توضیحات' }}</span>
                </div>

                <div class="text-center">
                  <template v-if="item.status">
                    <del v-if="hasOffer(item)" class="text-xs text-base-content/40 block">
                      {{ item.service_features?.display_price_object?.origin_price_display }}
                    </del>
                    <span class="font-black text-primary text-base">
                      {{ item.service_features?.display_price_object?.price_with_offer_display }}
                    </span>
                    <span v-if="hasChildPrice(item)" class="block text-xs text-base-content/50 mt-0.5">
                      کودک: {{ item.service_features?.child_price_display }}
                    </span>
                  </template>
                  <span v-else class="text-xs text-error font-bold">ناموجود</span>
                </div>

                <div class="justify-self-stretch px-2" @click.stop>
                  <button v-if="!serviceActive"
                    class="btn btn-ghost btn-dash text-base-content/30 w-full cursor-not-allowed" disabled>
                    <Ban :size="12" /> قابل خرید نیست
                  </button>
                  <button v-else-if="!item.status"
                    class="btn btn-ghost btn-dash text-base-content/30 w-full cursor-not-allowed" disabled>
                    ناموجود
                  </button>
                  <button v-else-if="selectedId === item.id" class="btn w-full font-semibold btn-primary"
                    @click="selectItem(item, section.genderLabel)">
                    <CheckCircle :size="12" /> انتخاب شد
                  </button>
                  <button v-else class="btn w-full font-semibold btn-primary btn-dash"
                    @click="handleBuy(item, section.genderLabel)">
                    <ShoppingCart :size="12" /> خرید بلیت
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>