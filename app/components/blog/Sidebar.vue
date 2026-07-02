<!-- components/blog/BlogSidebar.vue -->
<script setup lang="ts">
import { Layers, MapPin, Flame } from 'lucide-vue-next'
import type { BlogSideCategory, BlogSideLocation, BlogSideTopPost } from '~/types/blog.types'

const props = withDefaults(
  defineProps<{
    data: {
      top_locations?: { data: BlogSideLocation[]; title: string; sub_title: string }
      categories?: BlogSideCategory[]
      top_posts?: BlogSideTopPost[]
    }
    currentCategory: string
    loading: boolean
    isSinglePage?: boolean
  }>(),
  {
    isSinglePage: false
  }
)

const emit = defineEmits<{
  (e: 'select-category', slug: string): void
}>()

const router = useRouter()

function handleCategoryClick(slug: string) {
  if (props.isSinglePage) {
    router.push({
      path: '/blog',
      query: slug ? { cat: slug } : {}
    })
  } else {
    emit('select-category', slug)
  }
}
</script>

<template>
  <aside class="space-y-6">
    <div v-if="loading" class="bg-base-100 rounded-3xl p-6 border border-base-200 space-y-6">
      <div v-for="i in 3" :key="i" class="skeleton h-32 w-full rounded-2xl" />
    </div>

    <template v-else>
      <div v-if="data.categories?.length" class="bg-base-100 rounded-3xl p-5 border border-base-200">
        <h3 class="font-bold text-base mb-4 flex items-center gap-2 border-b border-base-100 pb-3">
          <Layers class="size-5 text-primary" />
          <span>دسته‌بندی‌ها</span>
        </h3>
        <div class="flex flex-col gap-1">
          <button
            class="flex items-center justify-between px-3 py-2.5 rounded-xl transition text-sm text-right cursor-pointer"
            :class="!currentCategory ? 'bg-primary text-primary-content font-medium' : 'hover:bg-base-200 text-base-content/80'"
            @click="handleCategoryClick('')"
          >
            <span>همه مقالات</span>
          </button>
          <button
            v-for="cat in data.categories"
            :key="cat.id"
            class="flex items-center justify-between px-3 py-2.5 rounded-xl transition text-sm text-right cursor-pointer"
            :class="currentCategory === cat.slug ? 'bg-primary text-primary-content font-medium' : 'hover:bg-base-200 text-base-content/80'"
            @click="handleCategoryClick(cat.slug)"
          >
            <span>{{ cat.name }}</span>
          </button>
        </div>
      </div>

      <div v-if="data.top_locations?.data?.length" class="bg-base-100 rounded-3xl p-5 border border-base-200">
        <div class="mb-4 border-b border-base-100 pb-3">
          <h3 class="font-bold text-base flex items-center gap-2">
            <MapPin class="size-5 text-primary" />
            <span>{{ data.top_locations.title }}</span>
          </h3>
          <p class="text-xs text-base-content/50 mt-1">{{ data.top_locations.sub_title }}</p>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <NuxtLink
            v-for="loc in data.top_locations.data.filter(l => l.media)"
            :key="loc.id"
            :to="loc.url"
            class="group relative h-20 rounded-2xl overflow-hidden block"
          >
            <img
              :src="loc.media?.image_url"
              :alt="loc.name"
              class="w-full h-full object-cover transition duration-300 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end p-2">
              <span class="text-xs font-medium text-white">{{ loc.name }}</span>
            </div>
          </NuxtLink>
        </div>
      </div>

      <div v-if="data.top_posts?.length" class="bg-base-100 rounded-3xl p-5 border border-base-200">
        <h3 class="font-bold text-base mb-4 flex items-center gap-2 border-b border-base-100 pb-3">
          <Flame class="size-5 text-primary" />
          <span>مقالات پیشنهادی</span>
        </h3>
        <div class="space-y-3">
          <NuxtLink
            v-for="post in data.top_posts"
            :key="post.id"
            :to="post.url"
            class="block text-sm leading-6 text-base-content/80 hover:text-primary transition line-clamp-2 line-animate"
          >
            {{ post.title }}
          </NuxtLink>
        </div>
      </div>
    </template>
  </aside>
</template>