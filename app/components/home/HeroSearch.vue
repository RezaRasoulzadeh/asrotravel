// components/home/HeroSearch.vue
<script setup lang="ts">
import PersianDateRangePicker from '~/components/ui/PersianDateRangePicker.vue'
import GuestCountPicker from '~/components/ui/GuestCountPicker.vue'
import { Search } from 'lucide-vue-next'
import { useSearchOptions } from '~/composables/useSearchOptions'
import { buildPoolSearchQuery } from '~/composables/usePoolSearch'
import { buildHotelSearchQuery } from '~/composables/useHotelSearch'
import { buildTicketSearchQuery } from '~/composables/useTicketSearch'

defineProps<{ imageSrc?: string }>()

const router = useRouter()
const { options } = useSearchOptions()

const tabs = [
  { key: 'hotels',  label: 'هتل و مراکز اقامتی' },
  { key: 'pools',   label: 'استخر و آبدرمانی' },
  { key: 'fun',     label: 'مجموعه‌های تفریحی' },
]
const activeTab = ref('hotels')

const hotelDestination = ref('')
const enterDate = ref('')
const exitDate = ref('')
const guests = ref({ adults: 1, kids: 0 })

watch(enterDate, (val) => {
  if (val && exitDate.value) {
    const a = parseInt(val.replace(/\//g, ''))
    const b = parseInt(exitDate.value.replace(/\//g, ''))
    if (b < a) exitDate.value = ''
  }
})

const poolDestination = ref('')
const poolCategory = ref<number | null>(null)
const poolName = ref('')

const funDestination = ref('')
const funCategory = ref<number | null>(null)
const funName = ref('')

function onSearch() {
  if (activeTab.value === 'hotels') {
    const totalGuests = guests.value.adults + guests.value.kids
    const query: Record<string, string> = {}

    if (hotelDestination.value) query.location = hotelDestination.value
    if (enterDate.value) query.date_from = enterDate.value
    if (exitDate.value) query.date_to = exitDate.value
    if (totalGuests > 0) query.number = String(totalGuests)

    router.push({
      path: '/hotel/search',
      query: buildHotelSearchQuery({
        ...query,
        page: 1,
      }),
    })
    return
  }

  if (activeTab.value === 'pools') {
    router.push({
      path: '/pool/search',
      query: buildPoolSearchQuery({
        location: poolDestination.value || undefined,
        category_id: poolCategory.value || undefined,
        name: poolName.value || undefined,
        page: 1,
      }),
    })
    return
  }

  if (activeTab.value === 'fun') {
    const selectedTerms: number[] = []
    if (funCategory.value) {
      selectedTerms.push(funCategory.value)
    }

    router.push({
      path: '/ticket/search',
      query: buildTicketSearchQuery({
        location: funDestination.value || undefined,
        name: funName.value || undefined,
        terms: selectedTerms.length ? selectedTerms : undefined,
        page: 1,
      }),
    })
  }
}
</script>

<template>
  <section class="hero-section mt-16 px-4 lg:px-16">
    <div class="grid grid-cols-1 items-start w-full">

      <div class="col-start-1 row-start-1 w-full h-[40vh] lg:h-[58vh] rounded-3xl lg:rounded-4xl overflow-hidden z-0">
        <img
          :src="imageSrc ?? '/travel-hero.jpg'"
          alt="آسروتراول"
          class="hero-img w-full h-full object-cover object-center"
        />
      </div>

      <div class="col-start-1 row-start-1 z-10 w-full max-w-6xl mx-auto px-2 sm:px-4 mt-[30vh] lg:mt-[42vh] 2xl:mt-[48vh]">
        <div class="search-card w-full bg-base-100 rounded-3xl lg:rounded-4xl shadow-2xl shadow-base-300/80 p-4 lg:px-6 lg:py-6">

          <div class="px-2 pt-1 border-b border-base-300">
            <div class="tabs-row flex overflow-x-auto scrollbar-none">
              <button
                v-for="(tab, i) in tabs"
                :key="tab.key"
                class="tab-btn px-4 py-3 text-sm md:text-base font-medium rounded-t-lg whitespace-nowrap transition-all duration-200 relative cursor-pointer"
                :class="activeTab === tab.key
                  ? 'text-primary'
                  : 'text-base-content/50 hover:text-base-content'"
                :style="{ '--i': i }"
                @click="activeTab = tab.key"
              >
                {{ tab.label }}
                <span
                  v-if="activeTab === tab.key"
                  class="tab-indicator absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                />
              </button>
            </div>
          </div>

          <Transition name="panel" mode="out-in">

            <div
              v-if="activeTab === 'hotels'"
              key="hotels"
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 items-end gap-4 pt-4"
            >
              <fieldset class="fieldset field-animate" style="--fi:0">
                <legend class="fieldset-legend flex items-center gap-1">
                  <span class="text-base-content">شهر</span>
                </legend>
                <select v-model="hotelDestination" class="select-custom">
                  <option value="">همه شهرها</option>
                  <option v-for="d in options.destinations" :key="d.slug" :value="d.slug">
                    {{ d.name }}
                  </option>
                </select>
              </fieldset>

              <div class="md:col-span-2 field-animate" style="--fi:1">
                <PersianDateRangePicker v-model:startValue="enterDate" v-model:endValue="exitDate" />
              </div>

              <fieldset class="fieldset field-animate" style="--fi:2">
                <legend class="fieldset-legend">مهمان</legend>
                <GuestCountPicker v-model="guests" />
              </fieldset>

              <button
                class="btn btn-primary rounded-xl mb-1 gap-2 px-5 search-btn field-animate w-full"
                style="--fi:3"
                @click="onSearch"
              >
                <Search class="size-5" />
                جستجو
              </button>
            </div>

            <div
              v-else-if="activeTab === 'pools'"
              key="pools"
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-4 pt-4"
            >
              <fieldset class="fieldset field-animate" style="--fi:0">
                <legend class="fieldset-legend flex items-center gap-1">
                  <span class="text-base-content">شهر</span>
                </legend>
                <select v-model="poolDestination" class="select-custom">
                  <option value="">همه شهرها</option>
                  <option v-for="d in options.destinations" :key="d.slug" :value="d.slug">
                    {{ d.name }}
                  </option>
                </select>
              </fieldset>

              <fieldset class="fieldset field-animate" style="--fi:1">
                <legend class="fieldset-legend">نوع استخر</legend>
                <select v-model="poolCategory" class="select-custom">
                  <option :value="null">همه</option>
                  <option v-for="c in options.poolCategories" :key="c.slug" :value="c.id">
                    {{ c.name }}
                  </option>
                </select>
              </fieldset>

              <fieldset class="fieldset field-animate" style="--fi:2">
                <legend class="fieldset-legend">جستجو در نام</legend>
                <input v-model="poolName" type="text" class="input w-full" placeholder="نام استخر..." @keyup.enter="onSearch"/>
              </fieldset>

              <button
                class="btn btn-primary rounded-xl mb-1 gap-2 px-5 search-btn field-animate w-full"
                style="--fi:3"
                @click="onSearch"
              >
                <Search class="size-5" />
                جستجو
              </button>
            </div>

            <div
              v-else
              key="fun"
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-4 pt-4"
            >
              <fieldset class="fieldset field-animate" style="--fi:0">
                <legend class="fieldset-legend flex items-center gap-1">
                  <span class="text-base-content">شهر</span>
                </legend>
                <select v-model="funDestination" class="select-custom">
                  <option value="">همه شهرها</option>
                  <option v-for="d in options.destinations" :key="d.slug" :value="d.slug">
                    {{ d.name }}
                  </option>
                </select>
              </fieldset>

              <fieldset class="fieldset field-animate" style="--fi:1">
                <legend class="fieldset-legend">نوع مجموعه</legend>
                <select v-model="funCategory" class="select-custom">
                  <option :value="null">همه</option>
                  <option v-for="c in options.ticketCategories" :key="c.slug" :value="c.id">
                    {{ c.name }}
                  </option>
                </select>
              </fieldset>

              <fieldset class="fieldset field-animate" style="--fi:2">
                <legend class="fieldset-legend">جستجو در نام</legend>
                <input v-model="funName" type="text" class="input w-full" placeholder="نام مجموعه..." @keyup.enter="onSearch"/>
              </fieldset>

              <button
                class="btn btn-primary rounded-xl mb-1 gap-2 px-5 search-btn field-animate w-full"
                style="--fi:3"
                @click="onSearch"
              >
                <Search class="size-5" />
                جستجو
              </button>
            </div>

          </Transition>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.hero-img {
  animation: hero-reveal 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes hero-reveal {
  from { opacity: 0; transform: scale(1.015); }
  to   { opacity: 1; transform: scale(1); }
}

.search-card {
  animation: card-rise 0.7s 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes card-rise {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.tab-indicator {
  animation: indicator-grow 0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
  transform-origin: center;
}
@keyframes indicator-grow {
  from { transform: scaleX(0.4); opacity: 0; }
  to   { transform: scaleX(1);   opacity: 1; }
}

.panel-enter-active { transition: opacity 0.18s ease, transform 0.18s cubic-bezier(0.22, 1, 0.36, 1); }
.panel-leave-active { transition: opacity 0.12s ease, transform 0.12s ease; }
.panel-enter-from   { opacity: 0; transform: translateY(6px); }
.panel-leave-to     { opacity: 0; transform: translateY(-4px); }

.field-animate {
  animation: field-in 0.25s calc(0.05s * var(--fi, 0)) cubic-bezier(0.22, 1, 0.36, 1) both;
}
.panel-leave-active .field-animate { animation: none; }
@keyframes field-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.search-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
.search-btn:not(:disabled):hover  { outline: 2px dashed var(--color-primary); }
.search-btn:not(:disabled):active { transform: translateY(0); box-shadow: none; }
.search-btn:disabled { opacity: 0.45; cursor: not-allowed; }
</style>