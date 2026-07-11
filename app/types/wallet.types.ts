// app/types/wallet.types.ts

export interface WalletPayoutInfo {
  bank_cart: string
  sheba_number: string
  bank_name: string
  account_name?: string
}

export interface WalletUserMeta {
  val: Record<string, WalletPayoutInfo>
  id?: number
  user_id?: number
  name?: string
  create_user?: number
  update_user?: number | null
  created_at?: string
  updated_at?: string
}

export interface WalletRecord {
  meta?: Record<string, unknown>
  id: number
  holder_type?: string
  holder_id?: number
  name?: string
  uuid?: string
  slug?: string
  description?: string | null
  balance: string
  decimal_places?: number
  create_user?: number
  update_user?: number | null
  created_at?: string
  updated_at?: string
}

export interface GetWalletUser {
  full_name?: string
  id: number
  first_name: string
  last_name: string
  national_id?: string
  mobile?: string
  balance?: number
  birthday?: string
  user_name?: string | null
  email?: string
  gender?: number | null
  Token?: string | null
  ImageUrl?: string | null
  active_status?: number
  is_organization?: boolean
  IsActive?: boolean
  IsGuild?: boolean
  IsSpecial?: boolean
  city?: string | null
  state?: string | null
  country?: string | null
  user_meta?: WalletUserMeta | null
  wallet: WalletRecord
  payouts?: unknown[]
}

export interface ActivePayoutMethod {
  id: string
  name: string
  desc: string | null
  min: string
  order: string
  user?: WalletPayoutInfo
}

export interface GetWalletResponse {
  active_payout_method: ActivePayoutMethod | null
  user: GetWalletUser
}

export interface WalletDepositListItem {
  name: string
  amount: string
  credit: string
}

export interface WalletDepositGateway {
  name: string
  logo: string
}

export interface GetWalletDepositResponse {
  wallet_deposit_lists: WalletDepositListItem[]
  gateways: Record<string, WalletDepositGateway>
}

export interface ActivateWalletResponse {
  success?: string
  user?: GetWalletUser
}

export interface WalletDepositPayload {
  deposit_amount: number | string
  payment_gateway: string
  confirmed: boolean
  deposit_option?: string
}

export interface WalletDepositResponse {
  redirect_url?: string
  url?: string
}

export interface WalletWithdrawPayload {
  amount: number
  confirmed: boolean
  payout_method: string
}