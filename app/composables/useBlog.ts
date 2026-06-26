// composables/useBlog.ts

import type { BlogFeedResponse, BlogSideResponse } from '~/types/blog'

const STATIC_SEO = {
  title: 'مجله گردشگری آسرو تراول | راهنمای سفر و رزرو تفریحات',
  keywords: 'بلیط استخر،رزرو بلیط استخر، بلیط آبگرم، خرید بلیط استخر، بلیط تخفیف دار، بلیط استخر سرعین',
  description: 'خرید بلیط تخفیف دار استخر، ابدرمانی و آبگرم های سرعین، رزرو استخر خانوادگی، همواره با تخفیف در آسرو رزرو کنید.',
  canonical: 'https://asrotravel.com/blog',
  og_image: { image_url: 'https://panel.asrotravel.com/uploads/0000/31/2023/04/06/1f1e03ee1.jpg' }
}

export async function useBlog() {
  const route = useRoute()
  const router = useRouter()

  const currentPage = computed(() => parseInt(route.query.page as string) || 1)
  const currentCategory = computed(() => (route.query.cat as string) || '')

  const feedFetch = useFetch<BlogFeedResponse>('/api/blog/main', {
    query: { page: currentPage, cat: currentCategory },
    watch: [currentPage, currentCategory],
    default: () => ({ data: [], totalPages: 1 }),
  })

  const sideFetch = useFetch<BlogSideResponse>('/api/blog/side', {
    default: () => ({}),
  })

  const [{ data: feed, status: feedStatus }, { data: side, status: sideStatus }] = await Promise.all([feedFetch, sideFetch])

  const posts = computed(() => feed.value?.data ?? [])
  const totalPages = computed(() => feed.value?.totalPages ?? 1)
  const loading = computed(() => feedStatus.value === 'pending')

  const sideData = computed(() => side.value ?? {})
  const sideLoading = computed(() => sideStatus.value === 'pending')

  const pages = computed(() => {
    const current = currentPage.value
    const total = totalPages.value
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1)

    const items: (number | string)[] = [1]
    if (current > 3) items.push('...')

    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)

    for (let i = start; i <= end; i++) items.push(i)
    if (current < total - 2) items.push('...')
    items.push(total)
    return items
  })

  function goToPage(page: number | string) {
    if (typeof page === 'string') return
    router.push({ query: { ...route.query, page: page.toString() } })
  }

  function filterByCategory(slug: string) {
    router.push({ query: { cat: slug || undefined, page: '1' } })
  }

  watch([currentPage, currentCategory], () => {
    if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
  })

  return {
    posts,
    sideData,
    loading,
    sideLoading,
    currentPage,
    currentCategory,
    totalPages,
    pages,
    goToPage,
    filterByCategory,
    STATIC_SEO,
  }
}