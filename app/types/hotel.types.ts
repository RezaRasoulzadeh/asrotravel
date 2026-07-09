// src/types/hotel.types.ts

export interface HotelAttributeTerm {
  id:        number
  name:      string
  slug:      string
  attr_id:   number
  icon:      string | null
  parent_id: number | null
  content:   string | null
  image_id:  number | null
  origin_id: number | null
  lang:      string | null
}

export interface HotelAttribute {
  id:      number
  name:    string
  slug:    string
  service: string
  terms:   HotelAttributeTerm[]
}

export interface HotelLocation {
  id:   number
  name: string
  slug: string
}

export interface HotelBreadcrumb {
  title: string
  link:  string
}

export interface HotelSeoData {
  title?:       string
  description?: string
  keywords?:    string
  image?:       string
  [key: string]: unknown
}

export interface HotelSearchPageAttributes {
  location_list: HotelLocation[]
  attributes:    HotelAttribute[]
  min_max_range: {
    min_price: string
    max_price: string
  }
  seo?:        HotelSeoData
  breadcrumb?: HotelBreadcrumb[]
}

// ─── Search Filters ────────────────────────────────────────────────────────

export type HotelSortOption = 'default' | 'min-price' | 'max-price' | 'max-rate' | 'star_desc'

export interface HotelSearchFilters {
  location?:  string
  name?:      string
  terms?:     number[]
  star_rate?: number | null
  min_price?: number | null
  max_price?: number | null
  date_from?: string
  date_to?:   string
  number?:    number
  page?:      number
  sort?:      HotelSortOption
}

// ─── Core Hotel Entities ───────────────────────────────────────────────────

export interface HotelTermRef {
  id:        number
  term_id:   number
  target_id: number
  term: {
    id:   number
    name: string
  }
}

export interface HotelMedia {
  image_url:      string
  id:             number
  file_name:      string
  file_path:      string
  file_width:     number | null
  file_height:    number | null
  file_size:      number | null
  file_type:      string
  file_extension: string
  create_user:    number | null
}

export interface HotelLocationRef {
  name: string
  slug: string
  id:   number
}

export interface HotelCardItem {
  id:                number
  title:             string
  slug:              string
  url:               string
  star_rate:         number | null
  price:             string
  sale_price:        string | null
  min_price_display: string
  price_display:     string
  max_offer_percent: number
  address:           string
  location_id:       number
  image_id:          number
  banner_image_id:   number | null
  review_score:      number | null
  reviewsLength:     number
  status:            string
  is_featured:       boolean | null
  media:             HotelMedia
  location:          HotelLocationRef
  terms:             HotelTermRef[]
  wish_list?:        boolean | null
}

// ─── API Response Wrappers ─────────────────────────────────────────────────

export interface HotelSearchResponse {
  data:        HotelCardItem[]
  total:       number
  totalPages:  number
  currentPage: number
  perPage:     number
}

export interface Location {
  id: number
  title: string
  name: string
  slug: string
  map_lng: string
  map_lat: string
}

export interface Hotel {
  id: number
  title: string
  slug: string
  url: string
  address: string
  star_rate: number
  review_score: string | null
  reviewsLength: number
  price: string | null
  sale_price: string | null
  price_display?: string
  min_price_display?: string
  max_offer_percent: number
  image_id: number
  banner_image_id: number
  location_id: number
  status: string
  is_featured: boolean
  banner: HotelMedia
  location: Location
}

export interface Promotion {
  title: string
  meta: string
  more_link: {
    link: string
    _target: string
  }
  data: Hotel[]
}

export interface SettingData {
  title: string
  about: string
  description: string
  banner: HotelMedia
}

export interface SeoShareItem {
  title: string | null
  desc: string | null
  image: string | null
}

export interface Seo {
  title: string
  keywords: string
  description: string
  canonical: string
  category_title: string
  og_image: HotelMedia
  seo_share: {
    facebook: SeoShareItem
    twitter: SeoShareItem
  }
}

export interface Faq {
  title: string
  content: string
}

export interface HotelMainResponse {
  promotions: Promotion[]
  setting_data: SettingData
  seo: Seo
  faqs: Faq[]
}