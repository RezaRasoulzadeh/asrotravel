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

export interface BlogSeo {
  title?: string
  description?: string
  keywords?: string
  og_image?: { image_url: string }
}

export interface BlogAuthor {
  full_name?: string
}

export interface BlogSingle {
  id: number
  title: string
  content: string
  url: string
  slug: string
  created_at: string
  updated_at: string
  view_count: number
  comment_count: number
  like_count: number
  banner?: BlogBanner
  seo?: BlogSeo
  author?: BlogAuthor
}