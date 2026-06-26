// app/pages/index.vue
<script setup lang="ts">
import DestinationList from '~/components/home/DestinationList.vue'
import HeroSearch from '~/components/home/HeroSearch.vue'
import NewPostsList from '~/components/home/NewPostsList.vue'
import TopPostsList from '~/components/home/TopPostsList.vue'
import HotelList from '~/components/hotel/HotelList.vue'
import PoolList from '~/components/pool/PoolList.vue'
import TicketList from '~/components/ticket/TicketList.vue'
import FeaturesList from '~/components/ui/spacer/FeaturesList.vue'
import HowItWorks from '~/components/ui/spacer/HowItWorks.vue'
import TestimonialQuote from '~/components/ui/spacer/TestimonialQuote.vue'
import { useHomeData } from '~/composables/useHomeData'

const route = useRoute()

const { data } = useHomeData()

const seo = computed(() => data.value?.seo)

useSeoMeta({
  title: () => seo.value?.title || 'سامانه گردشگری',
  description: () => seo.value?.description || '',
  keywords: () => seo.value?.keywords || '',
  ogTitle: () => seo.value?.title || '',
  ogDescription: () => seo.value?.description || '',
  ogImage: () => seo.value?.og_image?.image_url || '',
  ogUrl: () => seo.value?.canonical || route.fullPath,
  twitterTitle: () => seo.value?.title || '',
  twitterDescription: () => seo.value?.description || '',
  twitterImage: () => seo.value?.og_image?.image_url || ''
})

useHead(() => ({
  link: [
    { rel: 'canonical', href: seo.value?.canonical || route.fullPath }
  ]
}))
</script>

<template>
  <div class="text-base-content">
    <HeroSearch />
    <PoolList />
    <HowItWorks />
    <HotelList />
    <FeaturesList />
    <TicketList />
    <DestinationList />  
    <TopPostsList/>
    <NewPostsList />
    <!-- <ProductList /> -->
    <TestimonialQuote />
  </div>
</template>