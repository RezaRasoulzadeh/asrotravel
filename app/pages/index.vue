// app/pages/index.vue
<script setup lang="ts">
import NewPostsList from '~/components/home/NewPostsList.vue'
import TopPostsList from '~/components/home/TopPostsList.vue'
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
    <!-- <HeroSearch />
    <PoolList />
    <HowItWorks />
    <HotelList />
    <Features />
    <TicketList />
    <DestinationList />  -->
    <TopPostsList/>
    <NewPostsList />
    <!-- <ProductList /> -->
    <TestimonialQuote />
  </div>
</template>