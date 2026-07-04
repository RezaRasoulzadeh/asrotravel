// types/poolSingle.types.ts

import type { PoolItem } from "./pool.types"

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
  name: string
  slug: string
  title?: string
  map_lng?: string
  map_lat?: string
}

export interface PoolTerm {
  id: number
  name: string
  term: {
    id: number
    name: string
  }
}

export interface ServiceFeatures {
  name: string
  desc: string | null
  rules: string | null
  code: string | null
  gender: 'any' | 'men' | 'women'
  price: string
  price_per_hour: string
  price_per_day: string
  offer: string
  unit: string
  price_type: string
  sans_period: string
  guest_capacity: string
  addational_person_available?: string
  max_guest_capacity: string | null
  price_per_person: string | null
  gallery: string | null
  is_deposit_payment: boolean | string
  commission: {
    vendor_commission_type: string | null
    vendor_commission_amount: string
  }
}

export interface PoolMeta {
  service_features: ServiceFeatures
  pool_id: number
  cat_id: number
}

export interface Pool {
  id: number
  title: string
  slug: string
  url: string
  address: string | null
  sans_text: string | null
  min_price: string | null
  min_price_view: string | number
  min_price_display?: string
  price_with_offer: number | null
  price_with_offer_display: string | number
  review_score: string | null
  reviewsLength: number
  image_id: number
  banner_image_id: number
  location_id: number | null
  status: string
  for_season: string | null
  service_active: number
  max_offer_percent: number | null
  is_featured: boolean | number | null
  banner: BannerImage
  location: Location | null
  terms?: PoolTerm[]
  pool_metas?: PoolMeta[]
}

export interface PoolGroup {
  data: Pool[]
  title: string
  description: string
  more_link: {
    link: string
    _target: string
  }
}

export interface PoolSearchResponse {
  total: number
  totalPages: number
  currentPage: number
  perPage: number
  data: Pool[]
}

export interface PoolSearchAttributeTerm {
  id: number
  name: string
  attr_id: number
  slug: string
}

export interface PoolSearchAttribute {
  id: number
  name: string
  slug: string
  hide_in_filter_search: boolean | number | null
  terms: PoolSearchAttributeTerm[]
}

export interface PoolSearchCategory {
  id: number
  name: string
  slug: string
  parent_id: number | null
  children: PoolSearchCategory[]
}

export interface PoolSearchPageAttributesResponse {
  attributes: PoolSearchAttribute[]
  categories: PoolSearchCategory[]
  min_max_range?: {
    min_price: number
    max_price: number
  }
}

export interface PoolSearchFilters {
  category_id?: number | null
  sort?: 'min-price' | 'max-price' | 'max-rate' | 'default' | null
  location?: string
  name?: string
  min_price?: number | null
  max_price?: number | null
  terms?: number[]
  page?: number
}

export interface Promotion {
  title: string
  meta: string
  more_link: {
    link: string
    _target: string
  }
  data: Pool[]
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
  seo_share: {
    facebook?: SeoShareItem
    twitter?: SeoShareItem
  }
}

export interface Faq {
  title: string
  content: string
}

export interface PoolMainResponse {
  promotions: Promotion[]
  setting_data: SettingData
  seo: Seo
  faqs: Faq[]
}

export type GalleryImage = BannerImage

export interface PoolSingleLocation {
  id: number
  name: string
  title: string
  slug: string
}

export interface PoolSingle {
  id: number
  title: string
  slug: string
  content: string | null
  address: string | null
  map_lat: string | null
  map_lng: string | null
  map_zoom: number | null
  is_featured: boolean | null
  gallery: string | null
  video: string | null
  min_price: string | null
  max_offer_percent: number | null
  max_guest: number | null
  cancel_policy: string | null
  terms_information: string | null
  review_score: string | null
  reviewsLength: number
  status: string
  service_active: number
  for_season: string | null
  faqs: Faq[]
  terms: PoolTerm[]
  location: PoolSingleLocation | null
  image_id: number
  banner_image_id: number
  min_price_display?: string
  price_with_offer_display?: string
}

export interface PoolSingleSeo {
  id: number
  title: string
  description: string | null
  keywords: string | null
  seo_image: number | null
  og_image: BannerImage | null
  share?: string
  canonical?: string
}

export interface PoolSingleResponse {
  pool: PoolSingle
  gallery: GalleryImage[]
  related: PoolItem[]
  seo: PoolSingleSeo | null
  link: string
}

export interface OpenHour {
  uuid: string
  day_number: string
  enable: string
  from: string
  to: string
  sans_time: string | null
  adult_price: string
  child_price: string | null
  offer: string
  unit: string
  type: string
  time_display: string
  date: string
  en_date: string
  end_date: string
  start_date: string
  day: string
  date_display: string
  child_price_display: string
  adult_price_with_offer: number
  min: number
  status: boolean
  status_text: string
  service_id: number
  service_type: string
  service_module: string
  number: number
  id: number
  origin_price_display: string
  price_with_offer_display: string
  child_price_with_offer: number | null
  display_price_object: {
    price_with_offer_display: string
    origin_price_display: string
  }
}

export interface TicketServiceFeatures {
  name: string
  desc: string | null
  code: string | null
  gender: 'men' | 'women' | 'any'
  number: string
  price: string
  offer: string
  unit: string
  type: string
  gallery: string | null
  is_deposit_payment: string | boolean
}

export interface VipServiceFeatures {
  name: string
  desc: string | null
  rules: string | null
  code: string | null
  gender: 'men' | 'women' | 'any'
  price: string
  price_per_hour: string | null
  price_per_day: string | null
  offer: string
  unit: string
  price_type: string
  sans_period: string
  guest_capacity: string
  addational_person_available: string | null
  max_guest_capacity: string | null
  price_per_person: string | null
  gallery: string | null
  is_deposit_payment: boolean | string
}

export interface SanseServiceBase {
  id: number
  pool_id: number
  service_type: string
  sale_price: number
  price: number
  enable_open_hours: number
  status: number
  cat_id: number
  create_user: number
  update_user: number | null
  created_at: string
  updated_at: string
  open_hours: OpenHour[]
  price_with_offer_display: string | null
}

export interface TicketSanseService extends SanseServiceBase {
  service_type: 'ticket'
  service_features: TicketServiceFeatures
  gallery_images: GalleryImage[] | null
  enable_service_types?: never
  enable_extra_price?: never
  extra_price?: never
  discount_by_people?: never
  gallery?: never
}

export interface VipSanseService extends SanseServiceBase {
  service_type: 'vip'
  service_features: VipServiceFeatures
  gallery: GalleryImage[]
  enable_service_types: boolean
  enable_extra_price: any | null
  extra_price: any | null
  discount_by_people: any | null
  gallery_images?: never
}

export type SanseService = TicketSanseService | VipSanseService

export type SanseCategoryMap = Record<string, Array<Record<string, SanseService[]>>>
export type VipCategoryMap   = Record<string, Array<Record<string, VipSanseService[]>>>

export interface VipChangeDateSlot {
  uuid: string
  name: string
  sans_period: number
  active: number
  event: string
  title: string
  price_html: string
  number: number
  en_date: string
  start: string
  end: string
  time_display: string
  day: { day_name: string; day_date: string }
  date_display: string
  service_id: number
  service_type: string
  id: number
  classNames: string[]
  eventClassNames?: string[]
  price: string
  offer: string
  offer_unit: string
  price_per_hour: string
  price_per_day: string
  price_per_sans: string
  backgroundColor: string
  eventBorderColor: string
}
export type TicketCategoryMap = Record<string, Array<Record<string, TicketSanseService[]>>>
export interface PoolSingleWithSanse extends PoolSingle {
  services?: PoolSanseResponse['services'] | null
}

export interface PoolSanseResponse {
  id: number
  min_price: string
  min_price_display: string
  price_with_offer: number
  price_with_offer_display: string
  max_number: number
  deposit_type: string
  deposit_fomular: string
  minDate: string
  extra_price: any[]
  buyer_fees: any[]
  services: {
    ticket: TicketCategoryMap
    vip: VipCategoryMap
  }
}