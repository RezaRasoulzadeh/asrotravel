<!-- pages/blog/[slug].vue -->
<script setup lang="ts">
import { CalendarDays, Eye, Heart, MessageCircle, User, Share2 } from 'lucide-vue-next'
import { parseBlogHtml } from '~/utils/blog/parser'
import ReviewSecion from '~/components/ui/review/ReviewSecion.vue'
import ShareModal from '~/components/ui/ShareModal.vue'

const route = useRoute()
const router = useRouter()

const slug = computed(() => (route.params as { slug: string }).slug)

const postFetch = useBlogSingle(slug)
const sideFetch = useBlogSide()

const [{ data: post, status: postStatus }, { data: side }] = await Promise.all([postFetch, sideFetch])

const postId = computed(() => post.value?.id ?? null)
const postWishList = computed(() => post.value?.wish_list)
const { isWish, toggleWish } = useWish('Blog', postId, postWishList)
const isShareOpen = ref(false)

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
                    <header class="mb-6 flex items-start justify-between gap-4">
                        <h1 class="text-2xl lg:text-4xl font-black text-base-content">
                            {{ post?.title }}
                        </h1>

                        <div class="flex items-center gap-2 shrink-0">
                            <button
                                @click="toggleWish"
                                class="p-2 hover:text-primary transition-colors bg-base-200 rounded-lg cursor-pointer"
                                :class="{ 'text-error hover:text-error': isWish }"
                                title="افزودن به علاقه‌مندی‌ها"
                            >
                                <Heart class="w-4 h-4" :class="{ 'fill-error': isWish }" />
                            </button>
                            <button
                                @click="isShareOpen = true"
                                class="p-2 hover:text-primary transition-colors bg-base-200 rounded-lg cursor-pointer"
                                title="اشتراک‌گذاری"
                            >
                                <Share2 class="w-4 h-4" />
                            </button>
                        </div>
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
                            <span>{{ (post.view_count ?? 0).toLocaleString('fa-IR') }}</span>
                        </div>

                        <div class="flex items-center gap-2">
                            <MessageCircle class="size-4" />
                            <span>{{ (post.comment_count ?? 0).toLocaleString('fa-IR') }}</span>
                        </div>

                        <div class="flex items-center gap-2">
                            <Heart class="size-4" />
                            <span>{{ (post.like_count ?? 0).toLocaleString('fa-IR') }}</span>
                        </div>
                    </div>

                    <!-- CONTENT -->
                    <BlogRenderer :blocks="blocks" class="mb-6 lg:mb-14" />

                    <!-- REVIEW SECTION -->
                    <ReviewSecion class="w-full" :params="{
                        object_id: post?.id ?? 0,
                        object_model: 'blog',
                        object_name: post?.slug ?? post?.title ?? ''
                    }" :is-logged-in="false" @login-click="router.push('/login')" />

                </template>
            </article>

            <!-- SIDEBAR -->
            <aside class="lg:col-span-1">
                <BlogSidebar :data="sideData" :current-category="''" :loading="loading" is-single-page />
            </aside>
        </div>
    </main>

    <ShareModal :is-open="isShareOpen" :title="post?.title" @close="isShareOpen = false" />
</template>