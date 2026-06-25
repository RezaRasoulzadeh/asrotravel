// src/types/pool.types.ts

// ─── Shared Pool Domain Components ──────────────────────────────────────────

export interface PoolBannerImage {
  id:             number
  image_url:      string
  file_name:      string
  file_path:      string
  file_width:     number | null
  file_height:    number | null
  file_size:      number | null
  file_type:      string
  file_extension: string
  create_user:    number | null
}

export interface PoolLocation {
  id:       number
  name:     string
  slug:     string
  title?:   string
  map_lng?: string
  map_lat?: string
}

export interface PoolTermRef {
  id:   number
  name: string
  term: {
    id:   number
    name: string
  }
}

export interface PoolServiceCommission {
  vendor_commission_type:   string | null
  vendor_commission_amount: string
}

export interface PoolServiceFeatures {
  name:                         string
  desc:                         string | null
  rules:                        string | null
  code:                         string | null
  gender:                       'any' | 'men' | 'women'
  price:                        string
  price_per_hour:               string
  price_per_day:                string
  offer:                        string
  unit:                         string
  price_type:                   string
  sans_period:                  string
  guest_capacity:               string
  addational_person_available?: string
  max_guest_capacity:           string | null
  price_per_person:             string | null
  gallery:                      string | null
  is_deposit_payment:           boolean | string
  commission:                   PoolServiceCommission
}

export interface PoolMeta {
  service_features: PoolServiceFeatures
  pool_id:          number
  cat_id:           number
}

export interface PoolCardBanner {
  id:             number
  image_url:      string
  file_name:      string
  file_path:      string
  file_width:     number
  file_height:    number
  file_size:      number
  file_type:      string
  file_extension: string
  create_user:    number
}

export interface PoolCardLocation {
  id:      number
  title:   string
  name:    string
  slug:    string
  map_lat: string
  map_lng: string
}

export interface PoolGroup {
  data: PoolItem[]
  title: string
  description: string
  more_link: {
    link: string
    _target: string
  }
}

export interface PoolItem {
  id:                        number
  title:                     string
  slug:                      string
  url:                       string
  status:                    string
  service_active:            number
  review_score:              string
  min_price:                 string
  max_offer_percent:         number
  banner_image_id:           number
  location_id:               number
  min_price_display?:        string
  min_price_view?:           string
  price_with_offer?:         number | string | null
  price_with_offer_display?: string
  sans_time?:                string
  sans_text?:                string
  image_id?:                 number
  address?:                  string
  for_season?:               string | null
  is_featured?:              boolean
  map_lat?:                  string
  map_lng?:                  string
  banner:                    PoolCardBanner
  location:                  PoolCardLocation
}

// ─── Group & Endpoint Wrapper Envelopes ──────────────────────────────────────

export interface PoolGroupMoreLink {
  link:    string
  _target: string
}

export interface PoolGroup {
  data:        PoolItem[]
  title:       string
  description: string
  more_link:   PoolGroupMoreLink
}

export interface PoolSearchResponse {
  total:       number
  totalPages:  number
  currentPage: number
  perPage:     number
  data:        PoolItem[]
}

export interface PoolSearchAttributeTerm {
  id:      number
  name:    string
  attr_id: number
  slug:    string
}

export interface PoolSearchAttribute {
  id:                    number
  name:                  string
  slug:                  string
  hide_in_filter_search: boolean | number | null
  terms:                 PoolSearchAttributeTerm[]
}

export interface PoolSearchCategory {
  id:        number
  name:      string
  slug:      string
  parent_id: number | null
  children:  PoolSearchCategory[]
}

export interface PoolSearchMinMaxRange {
  min_price: number
  max_price: number
}

export interface PoolSearchPageAttributesResponse {
  attributes:      PoolSearchAttribute[]
  categories:      PoolSearchCategory[]
  min_max_range?:  PoolSearchMinMaxRange
}

export interface PoolSearchFilters {
  category_id?: number | null
  sort?:        'min-price' | 'max-price' | 'max-rate' | 'default' | null
  location?:    string
  name?:        string
  min_price?:   number | null
  max_price?:   number | null
  terms?:       number[]
  page?:        number
}

export interface PoolPromotionMoreLink {
  link:    string
  _target: string
}

export interface PoolPromotion {
  title:     string
  meta:      string
  more_link: PoolPromotionMoreLink
  data:      PoolItem[]
}

export interface PoolSettingData {
  title?:       string
  about?:       string
  description?: string
  banner?:      PoolBannerImage
}

export interface PoolSeoShareItem {
  title: string | null
  desc:  string | null
  image: string | null
}

export interface PoolSeoShare {
  facebook?: PoolSeoShareItem
  twitter?:  PoolSeoShareItem
}

export interface PoolSeo {
  title:           string
  keywords?:       string
  description?:    string
  canonical:       string
  category_title:  string
  og_image:        PoolBannerImage
  seo_share:       PoolSeoShare
}

export interface PoolFaq {
  title:   string
  content: string
}

export interface PoolMainResponse {
  promotions:   PoolPromotion[]
  setting_data: PoolSettingData
  seo:          PoolSeo
  faqs:         PoolFaq[]
}