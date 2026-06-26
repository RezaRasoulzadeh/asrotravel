<!-- pages/blog/index.vue -->
<script setup lang="ts">
import { ChevronLeft, BookOpen, Clock } from 'lucide-vue-next'

const {
  posts,
  sideData,
  loading,
  sideLoading,
  currentCategory,
  filterByCategory,
  STATIC_SEO
} = await useBlog()

useSeoMeta({
  title: STATIC_SEO.title,
  description: STATIC_SEO.description,
  keywords: STATIC_SEO.keywords,
  ogTitle: STATIC_SEO.title,
  ogDescription: STATIC_SEO.description,
  ogImage: STATIC_SEO.og_image.image_url,
})

useHead({
  link: [{ rel: 'canonical', href: STATIC_SEO.canonical }],
})
</script>

<template>
  <main class="min-h-screen mt-24 px-4 lg:px-16 max-w-960 mx-auto mb-16">

    <header class="mb-8">
      <h1 class="text-2xl lg:text-3xl font-extrabold text-base-content flex items-center gap-3">
        <BookOpen class="size-7 text-primary" />
        <span>مجله گردشگری آسرو</span>
      </h1>
      <p class="text-base-content/60 text-sm mt-2">
        راهنما، اخبار و دانستنی‌های سفر، آبدرمانی‌ها و سوغات ایران
      </p>
    </header>

    <!-- Mobile categories -->
    <div class="lg:hidden mb-6 -mx-4 px-4 overflow-x-auto flex gap-2 scrollbar-none py-1">
      <button
        class="btn btn-sm rounded-full no-animation shrink-0 cursor-pointer"
        :class="!currentCategory ? 'btn-primary' : 'bg-base-100 border-base-200'"
        @click="filterByCategory('')"
      >
        همه مقالات
      </button>

      <button
        v-for="cat in sideData.categories"
        :key="cat.id"
        class="btn btn-sm rounded-full no-animation shrink-0 cursor-pointer"
        :class="currentCategory === cat.slug ? 'btn-primary' : 'bg-base-100 border-base-200'"
        @click="filterByCategory(cat.slug)"
      >
        {{ cat.name }}
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

      <section class="col-start-1 lg:col-span-3 order-1 lg:order-0">

        <!-- Loading -->
        <div v-if="loading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            v-for="i in 6"
            :key="i"
            class="bg-base-100 rounded-3xl p-4 border border-base-200 space-y-4"
          >
            <div class="skeleton h-48 w-full rounded-2xl" />
            <div class="skeleton h-4 w-3/4 rounded" />
            <div class="skeleton h-4 w-1/2 rounded" />
          </div>
        </div>

        <template v-else>

          <!-- Empty -->
          <div v-if="posts.length === 0" class="bg-base-100 border border-base-200 rounded-3xl p-12 text-center">
            <p class="text-base-content/50 text-sm">
              هیچ مقاله‌ای در این دسته‌بندی یافت نشد.
            </p>
          </div>

          <!-- Posts -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <article
              v-for="(post, index) in posts"
              :key="post.id"
              class="card-animate bg-base-100 border border-base-200 rounded-3xl overflow-hidden hover:shadow-xl hover:shadow-base-200/50 transition-all duration-300 flex flex-col group"
              :style="`--card-idx: ${index}`"
            >
              <NuxtLink :to="post.url" class="aspect-video w-full overflow-hidden block bg-base-200 relative">
                <img
                  :src="post.banner?.image_url"
                  :alt="post.title"
                  class="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                  loading="lazy"
                />
              </NuxtLink>

              <div class="p-5 flex flex-col grow justify-between">
                <div>
                  <NuxtLink :to="post.url" class="block">
                    <h2 class="font-bold text-base text-base-content line-clamp-2 leading-7 group-hover:text-primary transition-colors">
                      {{ post.title }}
                    </h2>
                  </NuxtLink>
                </div>

                <div class="flex items-center justify-between mt-5 pt-4 border-t border-base-100 text-xs text-base-content/50">
                  <span class="flex items-center gap-1">
                    <Clock class="size-3.5" />
                    زمان مطالعه ۵ دقیقه
                  </span>

                  <NuxtLink :to="post.url" class="text-primary font-medium flex items-center gap-0.5 group-hover:gap-1 transition-all">
                    <span>مطالعه مقاله</span>
                    <ChevronLeft class="size-4" />
                  </NuxtLink>
                </div>
              </div>
            </article>
          </div>

        </template>

      </section>

      <BlogSidebar
        class="col-span-1 order-2 lg:order-0"
        :data="sideData"
        :current-category="currentCategory"
        :loading="sideLoading"
        @select-category="filterByCategory"
      />

    </div>
  </main>
</template>

<style scoped>
.scrollbar-none::-webkit-scrollbar { display: none; }
.scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }

.card-animate {
  animation: card-up 0.5s calc(0.04s * var(--card-idx, 0)) cubic-bezier(0.215, 0.610, 0.355, 1) both;
}

@keyframes card-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.line-animate {
  position: relative;
  transition: color 0.2s ease;
}

.line-animate::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 0;
  height: 1px;
  background-color: var(--color-primary);
  transition: width 0.2s ease;
}

.line-animate:hover::after {
  width: 100%;
}
</style>