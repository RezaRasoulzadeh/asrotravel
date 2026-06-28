// types/place.types.ts

// ─── Category Types ─────────────────────────────────────────────────────────

export interface PlaceCategoryChildTranslate {
  id:                  number
  tourism_category_id: number
  title:               string
  description:         string | null
  keywords:            string | null
  lang_id:             number
  created_at:          string
  updated_at:          string
}

export interface PlaceCategoryChild {
  id:        number
  role:      number
  is_main:   number | null
  parent_id: number
  slug:      string
  translate: PlaceCategoryChildTranslate
}

export interface PlaceCategoryTranslate {
  id:                  number
  tourism_category_id: number
  title:               string
  description:         string | null
  keywords:            string | null
  lang_id:             number
  created_at:          string
  updated_at:          string
}

export interface PlaceCategory {
  id:                       number
  image_url:                string
  parent_id:                number
  role:                     number
  is_main:                  number
  is_viewable:              number
  key:                      string | null
  ename:                    string
  slug:                     string
  url:                      string
  location_search_page_url: string
  created_at:               string
  updated_at:               string
  deleted_at:               string | null
  translate:                PlaceCategoryTranslate
  media: {
    image_url: string
  }
  childrens:                PlaceCategoryChild[]
}

// ─── Search Result Types ────────────────────────────────────────────────────

export interface PlaceSearchItemTranslate {
  title:    string
  place_id: number
  address:  string
  tozihat:  string
}

export interface PlaceSearchItemCity {
  title: string | null
  id:    number
}

export interface PlaceSearchItem {
  id:                   number
  url:                  string
  title:                string
  imageUrl:             string
  image_url:            string
  ename:                string
  view_price:           number
  category_id:          number
  city_id:              string
  latitude:             string
  longitude:            string
  time:                 number
  access_time:          number | null
  gravity_id:           number
  track:                unknown | null
  view_count:           number
  like_count:           number
  memorise_count:       number
  comment_count:        number
  rate:                 number
  review_score:         number
  is_verified:          boolean
  inserter_id:          number
  is_active:            boolean
  is_special:           boolean
  star:                 unknown | null
  is_verified_marketer: boolean
  is_marketerInserted:  boolean
  created_at:           string
  updated_at:           string
  translate:            PlaceSearchItemTranslate
  city:                 PlaceSearchItemCity
}

export interface PlaceSearchSeoOgImage {
  image_url: string
}

export interface PlaceSearchSeo {
  title:       string
  description: string
  keywords:    string
  og_image:    PlaceSearchSeoOgImage
  created_at:  string
  updated_at:  string
}

export interface PlaceSearchResponse {
  total:       number
  data:        PlaceSearchItem[]
  totalPages:  number
  currentPage: number
  perPage:     number
  seo:         PlaceSearchSeo
}

export interface PlaceSearchAttributesResponse {
  categories: PlaceCategory[]
}

// ─── Composable Filter Shape ────────────────────────────────────────────────

export interface PlaceSearchFilters {
  location?: string
  cat?:      string
  page:      number
  sort?:     'default' | 'most-viewed' | 'most-liked' | 'max-rate'
}