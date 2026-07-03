// app/types/dashboardBookings.types.ts

export type BookingTab = "pool" | "hotel" | "ticket";
export type BookingObjectModel = "Pool" | "Hotel" | "Ticket";

// TODO: sourced from admin panel's booking report tabs — only `draft` confirmed against
// a real sample so far. Rest unconfirmed on user-side dashboard.
export type BookingStatus =
  | "draft"
  | "unpaid"
  | "processing"
  | "accepted"
  | "confirmed"
  | "partial_payment"
  | "paid"
  | "completed"
  | "cancelled"
  | "expire";

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  draft: "پیش‌نویس",
  unpaid: "پرداخت نشده",
  processing: "در حال پردازش",
  accepted: "پذیرفته شده",
  confirmed: "تایید شده",
  partial_payment: "پرداخت جزئی",
  paid: "پرداخت شده",
  completed: "تکمیل شد",
  cancelled: "کنسل شد",
  expire: "منقضی شده",
};

export const BOOKING_STATUS_BADGE: Record<BookingStatus, string> = {
  draft: "badge-ghost",
  unpaid: "badge-warning",
  processing: "badge-warning",
  accepted: "badge-info",
  confirmed: "badge-success",
  partial_payment: "badge-warning",
  paid: "badge-success",
  completed: "badge-success",
  cancelled: "badge-error",
  expire: "badge-error",
};

export type BookingAction = "continue" | "pay" | "cancel" | "rebook" | "review";

// TODO: guessed mapping — confirm which statuses actually allow cancel/pay/continue
// against the real backend once non-draft samples exist.
export const BOOKING_STATUS_ACTIONS: Record<BookingStatus, BookingAction[]> = {
  draft: ["continue"],
  unpaid: ["continue", "cancel"],
  processing: [],
  accepted: ["cancel"],
  confirmed: ["cancel"],
  partial_payment: ["pay", "cancel"],
  paid: ["review"],
  completed: ["rebook", "review"],
  cancelled: ["rebook"],
  expire: ["rebook"],
};

export type BookingSortOption =
  | "newest"
  | "oldest"
  | "price_high"
  | "price_low";

export const BOOKING_SORT_LABELS: Record<BookingSortOption, string> = {
  newest: "جدیدترین",
  oldest: "قدیمی‌ترین",
  price_high: "بیشترین مبلغ",
  price_low: "کمترین مبلغ",
};

export interface BookingLocation {
  name: string;
  id: number;
  slug: string;
}

export interface BookingService {
  title: string;
  id: number;
  slug: string;
  location_id: number;
  object_id: number;
  location: BookingLocation;
}

export interface BookingMetaVal {
  uuid: string;
  day_number: string;
  enable: string;
  from: string;
  to: string;
  sanse_time: string | null;
  adult_price: string;
  child_price: string | null;
  marketer_price: string;
  marketer_sale_price: string;
  offer: string | number;
  unit: string;
  type: string;
  time_display: string;
  date: string;
  en_date: string;
  end_date: string;
  start_date: string;
  day: string;
  date_display: string;
  child_price_display: string;
  adult_price_with_offer: number;
  min: number;
  status: boolean;
  status_text: string;
  service_id: number;
  service_type: string;
  service_module: BookingObjectModel;
  number: number;
  id: number;
  origin_price_display: string;
  price_with_offer_display: string;
  child_price_with_offer: number | null;
  slug: string;
  total_price: number;
  total_price_with_offer: number;
  quantity: {
    adult?: { quantity: number };
    child?: { quantity: number };
  };
  reservation_code: string;
  total_offer: number;
  created_ticket: string;
  total_price_display: string;
  title: string;
}

export interface BookingMeta {
  val: BookingMetaVal;
  id: number;
  booking_id: number;
  name: string;
  create_user: number | null;
  update_user: number | null;
}

export interface DashboardBooking {
  total_display: string;
  offer_display: string;
  coupon_amount_display: string;
  status_text: string;
  buyer_fees: string;
  id: number;
  code: string;
  vendor_id: number;
  customer_id: number;
  payment_id: number | null;
  gateway: string | null;
  object_id: number;
  object_model: BookingObjectModel;
  start_date: string;
  end_date: string;
  total: string;
  total_guests: number;
  currency: string | null;
  status: string;
  deposit: string | null;
  deposit_type: string | null;
  commission: string;
  commission_type: string | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  mobile: string | null;
  address: string | null;
  address2: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  country: string | null;
  customer_notes: string | null;
  create_user: number | null;
  update_user: number | null;
  total_before_fees: string;
  paid_vendor: string | null;
  object_child_id: number | null;
  number: number | null;
  paid: string | null;
  pay_now: string | null;
  wallet_credit_used: number | null;
  wallet_total_used: number | null;
  wallet_transaction_id: number | null;
  is_refund_wallet: boolean | null;
  vendor_service_fee_amount: string;
  vendor_service_fee: string;
  is_paid: boolean | null;
  total_before_discount: string;
  coupon_amount: string;
  created_at: string;
  updated_at: string;
  service: BookingService;
  booking_meta: BookingMeta;
}

export interface DashboardBookingsResponse {
  total: number;
  data: DashboardBooking[];
  totalPages: number;
  currentPage: number;
  perPage: number;
}
