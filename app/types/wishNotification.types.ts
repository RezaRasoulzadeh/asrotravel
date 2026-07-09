// types/wishNotification.types.ts

export type WishableObjectModel = 'Pool' | 'Hotel' | 'Ticket' | 'Place' | 'Blog'

export interface AddWishPayload {
  object_model: WishableObjectModel
  object_id: number
}

export interface AddWishResponse {
  is_wish: boolean
}

export interface AddNotificationPayload {
  object_model: WishableObjectModel
  object_id: number
  send_notification: boolean
  send_sms: boolean
  type: string
}