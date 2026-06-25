// app/composables/useHomeData.ts

export interface Post {
  id: number
  url: string
  title: string
  imageUrl: string
  locationName: string | null
  viewCount: number
  likeCount: number
  reviewScore: number
}

export interface Blog {
  id: number
  url: string
  title: string
  imageUrl: string
  categoryName: string
  authorName: string
  date: string
}

export interface Seo {
  title?: string
  description?: string
  keywords?: string
  canonical?: string
  og_image?: { image_url?: string }
}

export interface HomeData {
  about: string
  topPosts: Post[]
  newPosts: Blog[]
  seo: Seo
  faqs: any[]
}

export function useHomeData() {
  const { data: transformedData, status, error } = useFetch('/api/home', {
    key: 'home-data',
    transform: (raw: any): HomeData => {
      if (!raw) return createFallbackData()

      const topPosts: Post[] = Array.isArray(raw?.top_posts?.data)
        ? raw.top_posts.data.map((p: any) => ({
            id: p?.id ?? 0,
            url: p?.url || '',
            title: p?.title || p?.translate?.title || '',
            imageUrl: p?.imageUrl || '',
            locationName: p?.location?.name || null,
            viewCount: p?.view_count ?? 0,
            likeCount: p?.like_count ?? 0,
            reviewScore: p?.review_score ?? 0
          }))
        : []

      const newPosts: Blog[] = Array.isArray(raw?.new_posts?.data)
        ? raw.new_posts.data.map((b: any) => ({
            id: b?.id ?? 0,
            url: b?.url || '',
            title: b?.title || '',
            imageUrl: b?.banner?.image_url || '',
            categoryName: b?.category?.name || '',
            authorName: b?.author?.full_name || '',
            date: b?.updated_at
              ? new Date(b.updated_at).toLocaleDateString('fa-IR')
              : ''
          }))
        : []

      return {
        about: raw?.about_section || '',
        topPosts,
        newPosts,
        seo: raw?.seo || {},
        faqs: raw?.faqs || []
      }
    },
    default: () => createFallbackData()
  })

  const loading = computed(() => status.value === 'pending')

  return {
    data: transformedData,
    loading,
    error
  }
}

function createFallbackData(): HomeData {
  return {
    about: '',
    topPosts: [],
    newPosts: [],
    seo: {},
    faqs: []
  }
}