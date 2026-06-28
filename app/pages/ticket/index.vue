// pages/ticket/index.vue
<script setup lang="ts">
import { Search } from 'lucide-vue-next'
import TicketList from '~/components/ticket/TicketList.vue';
import FAQ from '~/components/ui/FAQ.vue';
import HowItWorks from '~/components/ui/spacer/HowItWorks.vue';

defineProps<{ imageSrc?: string }>()

const router = useRouter()
const { options } = useSearchOptions()
const { promotions, settingData, seo, faqs, loading } = useTicketMain()

const destination = ref('')
const ticketCategory = ref<number | null>(null)
const ticketName = ref('')

useSeoMeta({
  title: () => seo.value?.title ?? 'رزرو بلیط تفریحی آنلاین',
  description: () => seo.value?.description ?? '',
  keywords: () => seo.value?.keywords ?? '',
  ogTitle: () => seo.value?.title ?? '',
  ogDescription: () => seo.value?.description ?? '',
  ogImage: () => seo.value?.og_image?.image_url ?? '',
})

useHead({
  link: [
    { rel: 'canonical', href: () => seo.value?.canonical ?? '' },
  ],
})

function onSearch() {
  const selectedTerms: number[] = []
  if (ticketCategory.value != null) {
    selectedTerms.push(ticketCategory.value)
  }

  router.push({
    path: '/ticket/search',
    query: buildTicketSearchQuery({
      location: destination.value || undefined,
      name: ticketName.value || undefined,
      terms: selectedTerms.length ? selectedTerms : undefined,
      page: 1,
    }),
  })
}
</script>

<template>
  <section class="hero-section mt-16 px-4 lg:px-16">
    <div class="grid grid-cols-1 items-start w-full">

      <!-- Hero image -->
      <div class="col-start-1 row-start-1 w-full h-[40vh] lg:h-[58vh] rounded-3xl lg:rounded-4xl overflow-hidden z-0 bg-base-200">
        <img
          src="/ticket-hero.jpg"
          alt="آسروتراول - تفریح و سرگرمی"
          class="hero-img w-full h-full object-cover object-center"
        />
      </div>

      <!-- Search card -->
      <div class="col-start-1 row-start-1 z-10 w-full max-w-6xl mx-auto px-2 sm:px-4 mt-[30vh] lg:mt-[46vh] 2xl:mt-[51vh]">
        <div class="search-card w-full bg-base-100 rounded-3xl lg:rounded-4xl shadow-2xl shadow-base-300/80 p-4 lg:px-6 lg:py-6">

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-4">

            <!-- Destination -->
            <fieldset class="fieldset field-animate" style="--fi:0">
              <legend class="fieldset-legend flex items-center gap-1">
                <span class="text-base-content">شهر</span>
              </legend>
              <select v-model="destination" class="select-custom">
                <option value="">همه شهرها</option>
                <option v-for="d in options.destinations" :key="d.slug" :value="d.slug">
                  {{ d.name }}
                </option>
              </select>
            </fieldset>

            <!-- Category -->
            <fieldset class="fieldset field-animate" style="--fi:1">
              <legend class="fieldset-legend">نوع مجموعه</legend>
              <select v-model="ticketCategory" class="select-custom">
                <option :value="null">همه</option>
                <option v-for="c in options.ticketCategories" :key="c.slug" :value="c.id">
                  {{ c.name }}
                </option>
              </select>
            </fieldset>

            <!-- Name search -->
            <fieldset class="fieldset field-animate" style="--fi:2">
              <legend class="fieldset-legend">جستجو در نام</legend>
              <input
                v-model="ticketName"
                type="text"
                class="input w-full"
                placeholder="نام مجموعه..."
                @keyup.enter="onSearch"
              />
            </fieldset>

            <!-- Search button -->
            <button
              class="btn btn-primary rounded-xl mb-1 gap-2 px-5 search-btn field-animate w-full"
              style="--fi:3"
              @click="onSearch"
            >
              <Search class="size-5" />
              جستجو
            </button>

          </div>
        </div>
      </div>

    </div>
  </section>

  <TicketList :promotions="promotions" />
  <HowItWorks />

  <section v-if="settingData?.description" class="px-4 lg:px-16 my-12">
    <div class="max-w-960 bg-base-100 p-6 lg:py-8 lg:px-16 rounded-3xl border border-base-200">
      <article class="prose max-w-none dynamic-description" v-html="settingData.description" />
    </div>
  </section>

  <FAQ title="سوالات متداول رزرو بلیط تفریحی" :items="faqs" :loading="loading" />
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

.field-animate {
  animation: field-in 0.25s calc(0.05s * var(--fi, 0)) cubic-bezier(0.22, 1, 0.36, 1) both;
}
@keyframes field-in {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}

.search-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
.search-btn:not(:disabled):hover  { outline: 2px dashed var(--color-primary); }
.search-btn:not(:disabled):active { transform: translateY(0); box-shadow: none; }
.search-btn:disabled { opacity: 0.45; cursor: not-allowed; }

:deep(.dynamic-description) h2 {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
:deep(.dynamic-description) p {
  line-height: 1.8;
  margin-bottom: 1rem;
  text-align: justify;
  color: hsl(var(--bc) / 0.8);
}
:deep(.dynamic-description) ol {
  list-style-type: decimal;
  padding-right: 1.25rem;
  margin-bottom: 1rem;
}
:deep(.dynamic-description) li {
  margin-bottom: 0.5rem;
}
</style>