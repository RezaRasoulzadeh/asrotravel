// app/types/wishlist.types.ts
import type { WishableObjectModel } from '~/types/wishNotification.types'

export type WishlistTab = 'pool' | 'hotel' | 'ticket' | 'blog'

export const WISHLIST_TABS: WishlistTab[] = ['pool', 'hotel', 'ticket', 'blog']

export const WISHLIST_TAB_LABELS: Record<WishlistTab, string> = {
  pool: 'استخر',
  hotel: 'هتل',
  ticket: 'بلیط',
  blog: 'وبلاگ',
}

export const WISHLIST_TAB_TO_SERVICE_PARAM: Record<WishlistTab, WishableObjectModel> = {
  pool: 'Pool',
  hotel: 'Hotel',
  ticket: 'Ticket',
  blog: 'Blog',
}

// TODO: raw external API shape is unconfirmed — this is a probe endpoint.
// Once we see a real response for each tab, replace `unknown` with a proper
// interface and add a DTO mapper (same pattern as dashboardBookings.ts).
export type WishListRawResponse = unknown