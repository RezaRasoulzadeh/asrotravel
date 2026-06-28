// composables/useTicketMain.ts
export interface BannerImage {
  id: number
  image_url: string
  file_name: string
  file_path: string
  file_width: number | null
  file_height: number | null
  file_size: number | null
  file_type: string
  file_extension: string
  create_user: number | null
}

export interface Location {
  id: number
  title: string
  name: string
  slug: string
  map_lng: string
  map_lat: string
}

export interface Ticket {
  id: number
  title: string
  slug: string
  url: string
  address: string | null
  sans_text: string | null
  min_price: string | null
  min_price_view: string | number
  price_with_offer_display: string | number
  review_score: string | null
  reviewsLength: number
  bookingCount: number
  image_id: number
  banner_image_id: number
  location_id: number | null
  status: string
  for_season: string | null
  service_active: number
  max_offer_percent: number | null
  is_featured: number | null
  banner: BannerImage
  location: Location | null
}

export interface Promotion {
  title: string
  meta: string
  more_link: {
    link: string
    _target: string
  }
  data: Ticket[]
}

export interface SettingData {
  title?: string
  about?: string
  description?: string
  banner?: BannerImage
}

export interface SeoShareItem {
  title: string | null
  desc: string | null
  image: string | null
}

export interface Seo {
  title: string
  keywords?: string
  description?: string
  canonical: string
  category_title: string
  og_image: BannerImage
  seo_share: SeoShareItem[] | {
    facebook?: SeoShareItem
    twitter?: SeoShareItem
  }
}

export interface Faq {
  title: string
  content: string
}

export interface TicketMainResponse {
  promotions: Promotion[]
  setting_data: SettingData
  seo: Seo
  faqs: Faq[]
}

export function useTicketMain() {
  const promotions = ref<Promotion[]>([])
  const settingData = ref<SettingData | null>(null)
  const seo = ref<Seo | null>(null)
  const faqs = ref<Faq[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTicketMain() {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await safeApiFetch<TicketMainResponse>('/api/ticket/main')

    promotions.value = data?.promotions ?? []
    settingData.value = data?.setting_data ?? null
    seo.value = data?.seo ?? null
    faqs.value = data?.faqs ?? []
    error.value = fetchError

    loading.value = false
  }

  fetchTicketMain()

  return {
    promotions,
    settingData,
    seo,
    faqs,
    loading,
    error,
    refresh: fetchTicketMain,
  }
}