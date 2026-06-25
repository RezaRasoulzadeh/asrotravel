// components/home/NewPostsList.vue
<script setup lang="ts">
import { List, User, Calendar } from 'lucide-vue-next'
import { useHomeData } from '~/composables/useHomeData'

const props = defineProps<{
  posts?: any[]
  title?: string
}>()

const router = useRouter()

const { data, loading: homeLoading } = props.posts === undefined
  ? useHomeData()
  : { data: ref(null), loading: ref(false) }

const posts = computed(() =>
  props.posts !== undefined
    ? props.posts.slice(0, 4)
    : data.value?.newPosts?.slice(0, 4) || []
)

const loading = computed(() =>
  props.posts !== undefined ? false : homeLoading.value
)

const cardAreas = ['lg:area-card2', 'lg:area-card1', 'lg:area-card3', 'lg:area-card4']
</script>

<template>
  <section class="mt-4" dir="rtl">
    <div class="flex flex-col gap-6 px-4 lg:px-16 max-w-960 mx-auto">
      <div class="text-center px-4 max-w-xl mx-auto">
        <p class="text-xs font-bold tracking-widest text-primary uppercase mb-2">وبلاگ</p>
        <h2 class="text-2xl md:text-3xl font-black text-base-content leading-snug">
          {{ title || 'آخرین مطالب و نوشته‌ها' }}
        </h2>
      </div>

      <div
        v-if="loading"
        class="grid grid-cols-1 gap-3 md:gap-4 pt-3 pb-12 lg:gap-3 lg:asymmetric-grid"
      >
        <div
          v-for="(area, i) in cardAreas"
          :key="i"
          class="bg-base-300 animate-pulse rounded-3xl cell"
          :class="area"
        />
        <div class="bg-base-300 animate-pulse rounded-3xl small-card lg:area-card5" />
      </div>

      <div
        v-else-if="posts.length"
        class="grid grid-cols-1 gap-3 md:gap-4 pt-3 pb-12 lg:gap-3 lg:asymmetric-grid"
      >
        <NuxtLink
          v-for="(post, index) in posts"
          :key="post.url || index"
          :to="post.url"
          class="group relative overflow-hidden shadow-sm rounded-3xl border border-base-200/50 block cell"
          :class="cardAreas[index]"
        >
          <img
            :src="post.imageUrl || post.banner?.image_url"
            :alt="post.title"
            class="absolute inset-0 w-full h-full object-cover will-change-transform transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-linear-to-t from-black/95 via-black/40 to-transparent" />
          <div class="absolute bottom-0 inset-x-0 p-4 md:p-6 text-right flex flex-col justify-end h-full">
            <span
              v-if="post.categoryName"
              class="badge badge-primary font-bold text-xxs mb-2 px-2.5 py-1 self-start"
            >
              {{ post.categoryName }}
            </span>
            <p class="text-white font-black text-base md:text-2xl leading-tight mb-3 line-clamp-2">
              {{ post.title }}
            </p>
            <div class="flex items-center gap-4 text-white/70 text-xxs md:text-xs pt-2 border-t border-white/10 justify-start flex-wrap">
              <span v-if="post.authorName || post.author?.full_name" class="flex items-center gap-1">
                <User class="size-3.5" />
                {{ post.authorName || post.author?.full_name }}
              </span>
              <span v-if="post.date || post.updated_at" class="flex items-center gap-1">
                <Calendar class="size-3.5" />
                {{ post.date || new Date(post.updated_at).toLocaleDateString('fa-IR') }}
              </span>
            </div>
          </div>
        </NuxtLink>

        <div class="small-card lg:area-card5">
          <button
            class="h-full w-full rounded-3xl border-2 border-dashed border-primary/30
                   flex flex-col items-center justify-center gap-2
                   text-primary/60 hover:text-primary hover:border-primary/60
                   cursor-pointer hover:bg-primary/5
                   transition-all duration-200 px-2"
            @click="router.push('/blog')"
          >
            <List class="size-5" />
            <span class="text-xs font-bold text-center leading-none">مشاهده همه</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.text-xxs { font-size: 0.7rem; }

.cell { position: relative; width: 100%; min-height: 220px; }
.small-card { position: relative; width: 100%; min-height: 120px; }

@media (min-width: 640px) {
  .cell { min-height: 280px; }
  .small-card { min-height: 160px; }
}

@media (min-width: 1024px) {
  .lg\:asymmetric-grid {
    display: grid !important;
    grid-template-columns: 50fr 35fr 15fr;
    grid-template-rows: 34fr 33fr 33fr;
    grid-template-areas:
      "card1 card2 card2"
      "card1 card3 card4"
      "card1 card3 card5";
    height: 78vh;
  }
  .cell, .small-card { height: 100%; min-height: 0 !important; }
  .lg\:area-card1 { grid-area: card1; }
  .lg\:area-card2 { grid-area: card2; }
  .lg\:area-card3 { grid-area: card3; }
  .lg\:area-card4 { grid-area: card4; }
  .lg\:area-card5 { grid-area: card5; }
}
</style>