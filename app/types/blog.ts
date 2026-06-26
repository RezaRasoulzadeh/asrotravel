// types/blog.types.ts

export interface BlogBanner {
  image_url: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  url: string
  banner: BlogBanner
}

export interface BlogSideLocation {
  id: number
  name: string
  slug: string
  url: string
  media: BlogBanner | null
}

export interface BlogSideCategory {
  id: number
  name: string
  slug: string
  url: string
}

export interface BlogSideTopPost {
  id: number
  title: string
  slug: string
  url: string
}

export interface BlogFeedResponse {
  data: BlogPost[]
  totalPages: number
}

export interface BlogSideResponse {
  top_locations?: { data: BlogSideLocation[]; title: string; sub_title: string }
  categories?: BlogSideCategory[]
  top_posts?: BlogSideTopPost[]
}