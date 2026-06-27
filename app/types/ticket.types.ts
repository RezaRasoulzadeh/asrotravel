// src/types/ticket.types.ts

export interface TicketSearchFilters {
  location?: string;
  name?: string;
  terms?: number[];
  page?: number;
  sort?: "default" | "price_low" | "price_high" | "rate";
  is_featured?: boolean;
  min_price?: number | null;
  max_price?: number | null;
}

export interface TicketBanner {
  image_url: string;
  id: number;
  file_name: string;
  file_path: string;
  file_width: number;
  file_height: number;
  file_size: number;
  file_type: string;
  file_extension: string;
  create_user: number;
}

export interface TicketLocation {
  name: string;
  slug: string;
  id: number;
}

export interface TicketItem {
  id: number;
  title: string;
  slug: string;
  url: string;
  image_id: number;
  banner_image_id: number;
  location_id: number | null;
  address: string | null;
  min_price: string | null;
  min_price_display: string | number;
  min_price_view: string | number;
  price_with_offer_display: string | number;
  price_with_offer: string | number | null;
  sans_text: string | null;
  review_score: number | null;
  status: string;
  for_season: string | null;
  service_active: number;
  max_offer_percent: number | null;
  is_featured: number | null;
  reviewsLength: number;
  banner: TicketBanner | null;
  location: TicketLocation | null;
  terms: number[];
}

export interface GroupTicketResponse {
  data: TicketItem[];
  title: string;
}

export interface TicketSearchResponse {
  total: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
  data: TicketItem[];
}

export interface TicketCategory {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  children: TicketCategory[];
}

export interface TicketBreadcrumb {
  title: string;
  link: string;
}

export interface TicketSeo {
  title: string;
  description: string;
  og_image: number;
  seo_share: any[];
  canonical: string;
  keywords: string;
}

export interface TicketSearchPageAttributes {
  filters: Record<string, any>;
  attributes: any[];
  categories: TicketCategory[];
  min_max_range: {
    min_price: number;
    max_price: number;
  };
  breadcrumb: TicketBreadcrumb[];
  seo: TicketSeo;
}