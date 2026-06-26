<!-- pages/blog/[slug].vue -->
<script setup lang="ts">
import { CalendarDays, Eye, Heart, MessageCircle, User } from 'lucide-vue-next'
import { parseBlogHtml } from '~/utils/blog/parser'
import ReviewSecion from '~/components/ui/review/ReviewSecion.vue'

const route = useRoute()
const router = useRouter()

const slug = computed(() => (route.params as { slug: string }).slug)

const postFetch = useBlogSingle(slug)
const sideFetch = useBlogSide()

const [{ data: post, status: postStatus }, { data: side }] = await Promise.all([postFetch, sideFetch])

const loading = computed(() => postStatus.value === 'pending')
const error = computed(() => postStatus.value === 'error')
const sideData = computed(() => side.value ?? {})

const blocks = computed(() => post.value ? parseBlogHtml(post.value.content) : [])

const seoTitle = computed(() => post.value?.seo?.title || post.value?.title || 'مجله آسرو')
const seoDescription = computed(() => post.value?.seo?.description || '')
const seoImage = computed(() =>
  post.value?.seo?.og_image?.image_url || post.value?.banner?.image_url || ''
)

useSeoMeta({
  title: seoTitle,
  description: seoDescription,
  keywords: () => post.value?.seo?.keywords || '',
  ogTitle: seoTitle,
  ogDescription: seoDescription,
  ogImage: seoImage,
  twitterTitle: seoTitle,
  twitterDescription: seoDescription,
  twitterImage: seoImage,
})

useHead({
  link: [{ rel: 'canonical', href: `https://asrotravel.com${route.fullPath}` }],
})
</script>

<template>
    <main class="min-h-screen mt-24 mb-16 px-4 lg:px-16 max-w-960 mx-auto">
        <!-- BREADCRUMB -->
        <div class="p-y-2 w-full">
            <div class="breadcrumbs text-sm text-base-content/60">
                <ul>
                    <li>
                        <NuxtLink to="/">صفحه اصلی</NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/blog">مجله گردشگری</NuxtLink>
                    </li>
                    <li class="text-base-content">
                        {{ post?.title }}
                    </li>
                </ul>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-24">
            <!-- CONTENT -->
            <article class="lg:col-span-3">
                <div v-if="loading" class="space-y-6">
                    <div class="skeleton aspect-video w-full rounded-3xl" />
                    <div class="skeleton h-10 w-3/4 rounded-2xl" />
                    <div class="space-y-3">
                        <div class="skeleton h-4 w-full" />
                        <div class="skeleton h-4 w-2/3" />
                    </div>
                </div>

                <div v-else-if="error || !post" class="p-10 text-center border rounded-3xl">
                    مقاله یافت نشد
                </div>

                <template v-else>
                    <!-- IMAGE -->
                    <div v-if="post.banner?.image_url" class="mb-6 aspect-16/7 overflow-hidden rounded-3xl border">
                        <img :src="post.banner.image_url" :alt="post.title" class="w-full h-full object-cover" />
                    </div>

                    <!-- HEADER -->
                    <header class="mb-6">
                        <h1 class="text-2xl lg:text-4xl font-black text-base-content">
                            {{ post?.title }}
                        </h1>
                    </header>

                    <!-- META -->
                    <div class="flex flex-wrap gap-5 text-sm text-base-content/60 mb-6">
                        <div class="flex items-center gap-2">
                            <CalendarDays class="size-4" />
                            <span>{{ new Date(post.created_at).toLocaleDateString('fa-IR') }}</span>
                        </div>

                        <div v-if="post.author?.full_name" class="flex items-center gap-2">
                            <User class="size-4" />
                            <span>{{ post.author.full_name }}</span>
                        </div>

                        <div class="flex items-center gap-2">
                            <Eye class="size-4" />
                            <span>{{ post.view_count.toLocaleString('fa-IR') }}</span>
                        </div>

                        <div class="flex items-center gap-2">
                            <MessageCircle class="size-4" />
                            <span>{{ post.comment_count.toLocaleString('fa-IR') }}</span>
                        </div>

                        <div class="flex items-center gap-2">
                            <Heart class="size-4" />
                            <span>{{ post.like_count.toLocaleString('fa-IR') }}</span>
                        </div>
                    </div>

                    <!-- CONTENT -->
                    <BlogRenderer :blocks="blocks" class="mb-6 lg:mb-14" />

                    <!-- REVIEW SECTION -->
                    <ReviewSecion class="w-full" :params="{
                        object_id: post?.id ?? 0,
                        object_model: 'blog',
                        object_name: post?.slug ?? post?.title ?? ''
                    }" :is-logged-in="false" @login-click="router.push('/auth/login')" />

                </template>
            </article>

            <!-- SIDEBAR -->
            <aside class="lg:col-span-1">
                <BlogSidebar :data="sideData" :current-category="''" :loading="loading" is-single-page />
            </aside>
        </div>
    </main>
</template>