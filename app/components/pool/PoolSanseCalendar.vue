// components/pool/PoolSanseCalendar.vue
<script setup lang="ts">
import { ShoppingCart, CheckCircle, Ban } from 'lucide-vue-next'
import type { SanseCategoryMap, OpenHour, SanseService } from '~/types/poolSingle.types'

type GenderKey = string

interface Section {
  categoryName: string
  genderLabel: GenderKey
  genderCode: 'men' | 'women'
  serviceName: string
  slots: OpenHour[]
}

interface Props {
  services?: {
    ticket?: SanseCategoryMap | null
    vip?: SanseCategoryMap | null
  } | null
  modelValue?: string | null
  serviceActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  serviceActive: true,
})

const emit = defineEmits<{
  'update:modelValue': [uuid: string | null]
  'add-to-cart': [slot: OpenHour & { gender: 'men' | 'women'; serviceName: string }]
}>()

const activeGender = ref<'men' | 'women'>('men')

const selectedUuid = computed({
  get: () => props.modelValue ?? null,
  set: (v) => emit('update:modelValue', v),
})

const genderSections = computed((): Section[] => {
  const result: Section[] = []
  const ticket = props.services?.ticket

  if (ticket == null || typeof ticket !== 'object') return result

  for (const categoryName of Object.keys(ticket)) {
    const categoryArr = ticket[categoryName]
    if (!Array.isArray(categoryArr)) continue

    for (const genderObj of categoryArr) {
      if (genderObj == null || typeof genderObj !== 'object') continue

      for (const genderKey of Object.keys(genderObj)) {
        const services = (genderObj as Record<string, unknown>)[genderKey]
        if (!Array.isArray(services)) continue

        for (const svc of services) {
          if (
            svc == null ||
            typeof svc !== 'object' ||
            !Array.isArray((svc as SanseService).open_hours) ||
            (svc as SanseService).service_features == null
          ) continue

          const typedSvc = svc as SanseService
          result.push({
            categoryName,
            genderLabel: genderKey,
            genderCode: typedSvc.service_features?.gender as 'men' | 'women',
            serviceName: typedSvc.service_features?.name ?? '',
            slots: typedSvc.open_hours.filter(
              (s): s is OpenHour => s != null && typeof s === 'object' && 'uuid' in s
            ),
          })
        }
      }
    }
  }
  return result
})

const sectionsByCategory = computed(() => {
  const map = new Map<string, Section[]>()
  const sections = genderSections.value

  if (sections == null) return map

  for (const section of sections) {
    if (section == null) continue
    if (!map.has(section.categoryName)) {
      map.set(section.categoryName, [])
    }
    map.get(section.categoryName)?.push(section)
  }
  return map
})

function getTabLabel(sections: Section[] | null | undefined, code: 'men' | 'women'): string {
  if (sections == null) return code === 'men' ? 'آقایان' : 'بانوان'
  const found = sections.find(s => s?.genderCode === code)
  return found?.genderLabel ?? (code === 'men' ? 'آقایان' : 'بانوان')
}

function hasOffer(slot: any): boolean {
  if (slot == null) return false
  return Number(slot.offer ?? 0) > 0
}

function hasChildPrice(slot: any): boolean {
  if (slot == null) return false
  return slot.child_price != null && slot.child_price !== '0' && slot.child_price_with_offer != null
}

function isBookable(slot: any): boolean {
  if (slot == null) return false
  return (props.serviceActive ?? false) && !!slot.status
}

function selectSlot(slot: any, genderCode: 'men' | 'women', serviceName: string) {
  if (!isBookable(slot)) return
  if (selectedUuid.value === slot.uuid) {
    selectedUuid.value = null
    return
  }
  selectedUuid.value = slot.uuid
  emit('add-to-cart', { ...slot, gender: genderCode, serviceName })
}

function handleBuy(slot: any, genderCode: 'men' | 'women', serviceName: string) {
  if (!isBookable(slot)) return

  navigateTo({
    path: '/cart/detail',
    state: {
      selectedSlot: slot,
      genderCode,
      serviceName
    }
  })
}
</script>

<template>
  <div dir="rtl" class="mt-8 flex flex-col gap-8">
    <div v-if="!serviceActive"
      class="flex items-center gap-2 rounded-2xl bg-error/10 border border-error/30 px-4 py-3 text-error text-sm font-medium">
      <Ban :size="16" class="shrink-0" />
      <span>این سرویس در حال حاضر فعال نیست و امکان رزرو وجود ندارد.</span>
    </div>

    <template v-for="[categoryName, sections] in sectionsByCategory" :key="categoryName">
      <div class="flex items-center gap-3">
        <span class="h-px flex-1 bg-base-300/60" />
        <h3 class="text-sm font-bold text-base-content/60 px-2">{{ categoryName }}</h3>
        <span class="h-px flex-1 bg-base-300/60" />
      </div>

      <div class="flex lg:hidden bg-base-200 p-1 rounded-xl w-full relative isolation-auto">
        <button type="button"
          class="flex-1 py-2.5 text-center text-sm font-bold rounded-lg transition-all duration-300 z-10"
          :class="activeGender === 'men' ? 'text-primary-content font-extrabold' : 'text-base-content/70'"
          @click="activeGender = 'men'">
          {{ getTabLabel(sections, 'men') }}
        </button>
        <button type="button"
          class="flex-1 py-2.5 text-center text-sm font-bold rounded-lg transition-all duration-300 z-10"
          :class="activeGender === 'women' ? 'text-secondary-content font-extrabold' : 'text-base-content/70'"
          @click="activeGender = 'women'">
          {{ getTabLabel(sections, 'women') }}
        </button>

        <div
          class="absolute top-1 bottom-1 right-1 w-[calc(50%-4px)] rounded-lg transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          :class="activeGender === 'men' ? 'translate-x-0 bg-primary' : '-translate-x-[calc(100%)] bg-secondary'" />
      </div>

      <div class="block lg:hidden overflow-hidden relative w-full">
        <template v-for="section in sections" :key="'mob-' + section.genderLabel + section.serviceName">
          <Transition enter-active-class="transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
            leave-active-class="transition duration-200 ease-in absolute top-0 left-0 w-full"
            enter-from-class="opacity-0 translate-y-4" leave-to-class="opacity-0 -translate-y-4">
            <div v-if="activeGender === section.genderCode"
              class="rounded-2xl border border-base-300/60 w-full bg-base-100"
              :class="{ 'opacity-60': !serviceActive }">
              <div class="flex justify-end px-4 py-2 bg-base-200/60 border-b border-base-300/40">
                <span class="text-xs font-semibold px-3 py-1 rounded-full"
                  :class="section.genderCode === 'men' ? 'bg-primary/15 text-primary' : 'bg-secondary/15 text-secondary'">
                  {{ section.serviceName }}
                </span>
              </div>

              <div class="w-full text-sm flex flex-col">
                <div class="flex flex-col w-full">
                  <div v-for="slot in (section.slots as any[])" :key="slot?.uuid ?? slot?.id"
                    class="border-b last:border-b-0 border-base-300/30 transition-colors flex flex-wrap items-center p-4 w-full gap-y-3"
                    :class="{
                      'opacity-40 bg-base-200/50': !slot.status,
                      'bg-primary/5': selectedUuid === slot.uuid,
                      'hover:bg-base-200/40 cursor-pointer': isBookable(slot),
                      'cursor-not-allowed': !isBookable(slot),
                    }" @click="selectSlot(slot, section.genderCode, section.serviceName)">
                    <div class="flex-1 basis-1/3 text-right whitespace-nowrap">
                      <span class="font-semibold text-base-content block">{{ slot.day }}</span>
                      <span class="block text-xs text-base-content/50 mt-0.5">{{ slot.date }}</span>
                    </div>

                    <div class="flex-1 basis-1/3 text-center">
                      <span class="font-mono text-xs tracking-wide text-base-content/80 ltr inline-block" dir="ltr">
                        {{ slot.time_display }}
                      </span>
                    </div>

                    <div class="flex-1 basis-1/3 text-left">
                      <template v-if="slot.status">
                        <del v-if="hasOffer(slot)" class="text-xs text-base-content/40 block">
                          {{ slot.display_price_object?.origin_price_display }}
                        </del>
                        <span class="font-bold"
                          :class="section.genderCode === 'men' ? 'text-primary' : 'text-secondary'">
                          {{ slot.display_price_object?.price_with_offer_display }}
                        </span>
                        <span v-if="hasChildPrice(slot)" class="block text-xs text-base-content/50 mt-0.5">
                          کودک: {{ slot.child_price_display }}
                        </span>
                      </template>
                      <span v-else class="text-xs text-error">{{ slot.status_text || 'ناموجود' }}</span>
                    </div>

                    <div class="w-full" @click.stop>
                      <button v-if="!serviceActive"
                        class="btn btn-ghost btn-dash text-base-content/30 w-full cursor-not-allowed" disabled>
                        <Ban :size="12" /> قابل رزرو نیست
                      </button>
                      <button v-else-if="!slot.status"
                        class="btn btn-ghost btn-dash text-base-content/30 w-full cursor-not-allowed" disabled>
                        {{ slot.status_text || 'ناموجود' }}
                      </button>
                      <button v-else-if="selectedUuid === slot.uuid" class="btn w-full font-semibold"
                        :class="section.genderCode === 'men' ? 'btn-primary' : 'btn-secondary'"
                        @click="selectSlot(slot, section.genderCode, section.serviceName)">
                        <CheckCircle :size="12" /> انتخاب شد
                      </button>
                      <button v-else class="btn w-full font-semibold"
                        :class="section.genderCode === 'men' ? 'btn-primary bg-primary/10 text-primary btn-dash' : 'btn-secondary bg-secondary/10 text-secondary btn-dash'"
                        @click="handleBuy(slot, section.genderCode, section.serviceName)">
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
        <div v-for="section in sections" :key="'desk-' + section.genderLabel + section.serviceName"
          class="flex-1 min-w-0 rounded-2xl overflow-hidden border border-base-300/60 w-full"
          :class="{ 'opacity-60': !serviceActive }">
          <div class="py-3 px-4 text-center font-bold text-base"
            :class="section.genderCode === 'men' ? 'bg-primary text-primary-content' : 'bg-secondary text-secondary-content'">
            {{ section.genderLabel }}
          </div>

          <div class="flex justify-end px-4 py-2 bg-base-200/60 border-b border-base-300/40">
            <span class="text-xs font-semibold px-3 py-1 rounded-full"
              :class="section.genderCode === 'men' ? 'bg-primary/15 text-primary' : 'bg-secondary/15 text-secondary'">
              {{ section.serviceName }}
            </span>
          </div>

          <div class="w-full text-sm flex flex-col">
            <div
              class="grid grid-cols-4 bg-base-200 text-base-content/60 text-xs py-2.5 px-4 font-medium border-b border-base-300/30">
              <div class="text-right">روز و تاریخ</div>
              <div class="text-center">زمان</div>
              <div class="text-center">قیمت</div>
              <div class="text-center">رزرو</div>
            </div>

            <div class="flex flex-col w-full">
              <div v-for="slot in (section.slots as any[])" :key="slot?.uuid ?? slot?.id"
                class="border-b last:border-b-0 border-base-300/30 transition-colors grid grid-cols-4 items-center p-3 w-full"
                :class="{
                  'opacity-40 bg-base-200/50': !slot.status,
                  'bg-primary/5': selectedUuid === slot.uuid,
                  'hover:bg-base-200/40 cursor-pointer': isBookable(slot),
                  'cursor-not-allowed': !isBookable(slot),
                }" @click="selectSlot(slot, section.genderCode, section.serviceName)">
                <div class="text-right whitespace-nowrap">
                  <span class="font-semibold text-base-content">{{ slot.day }}</span>
                  <span class="text-xs text-base-content/50 mr-2">{{ slot.date }}</span>
                </div>

                <div class="text-center">
                  <span class="font-mono text-xs tracking-wide text-base-content/80 ltr inline-block" dir="ltr">
                    {{ slot.time_display }}
                  </span>
                </div>

                <div class="text-center">
                  <template v-if="slot.status">
                    <del v-if="hasOffer(slot)" class="text-xs text-base-content/40 block">
                      {{ slot.display_price_object?.origin_price_display }}
                    </del>
                    <span class="font-bold" :class="section.genderCode === 'men' ? 'text-primary' : 'text-secondary'">
                      {{ slot.display_price_object?.price_with_offer_display }}
                    </span>
                    <span v-if="hasChildPrice(slot)" class="block text-xs text-base-content/50 mt-0.5">
                      کودک: {{ slot.child_price_display }}
                    </span>
                  </template>
                  <span v-else class="text-xs text-error">{{ slot.status_text || 'ناموجود' }}</span>
                </div>

                <div class="justify-self-stretch px-2" @click.stop>
                  <button v-if="!serviceActive"
                    class="btn btn-ghost btn-dash text-base-content/30 w-full cursor-not-allowed" disabled>
                    <Ban :size="12" /> قابل رزرو نیست
                  </button>
                  <button v-else-if="!slot.status"
                    class="btn btn-ghost btn-dash text-base-content/30 w-full cursor-not-allowed" disabled>
                    {{ slot.status_text || 'ناموجود' }}
                  </button>
                  <button v-else-if="selectedUuid === slot.uuid" class="btn w-full font-semibold"
                    :class="section.genderCode === 'men' ? 'btn-primary' : 'btn-secondary'"
                    @click="selectSlot(slot, section.genderCode, section.serviceName)">
                    <CheckCircle :size="12" /> انتخاب شد
                  </button>
                  <button v-else class="btn w-full font-semibold"
                    :class="section.genderCode === 'men' ? 'btn-primary btn-dash' : 'btn-secondary btn-dash'"
                    @click="handleBuy(slot, section.genderCode, section.serviceName)">
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