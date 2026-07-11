// app/types/wallet.types.ts

export interface WalletPayoutInfo {
  bank_cart: string
  sheba_number: string
  bank_name: string
  account_name?: string
}

export interface ActivePayoutMethod {
  id: string
  name: string
  desc: string | null
  min: string
  order: string
  user?: WalletPayoutInfo
}

export interface RawWalletUserMeta {
  val: Record<string, WalletPayoutInfo>
  id?: number
  user_id?: number
  name?: string
  create_user?: number
  update_user?: number | null
  created_at?: string
  updated_at?: string
}

export interface RawWalletRecord {
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

export interface RawWalletUser {
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
  ReagentToken?: string | null
  Token?: string | null
  ImageUrl?: string | null
  verification_code?: string | null
  verification_code_generate_time?: string | null
  active_status?: number
  LastLoginDate?: string | null
  LastActivityDate?: string | null
  is_organization?: boolean
  password?: string
  IsActive?: boolean
  IsGuild?: boolean
  IsSpecial?: boolean
  city?: string | null
  state?: string | null
  country?: string | null
  verify_submit_status?: string | null
  avatar_id?: number | null
  vendor_commission_type?: string | null
  vendor_commission_amount?: string | null
  user_meta?: RawWalletUserMeta | null
  user_metas?: RawWalletUserMeta[]
  wallet: RawWalletRecord
  payouts?: unknown[]
}

export interface GetWalletResponse {
  active_payout_method: ActivePayoutMethod | null
  user: RawWalletUser
}

export interface ActivateWalletResponse {
  success?: string
  user?: RawWalletUser
}

export interface WalletUserDto {
  full_name?: string
  first_name: string
  last_name: string
  wallet: { balance: string }
  user_meta: { id?: number; val: Record<string, WalletPayoutInfo> } | null
}

export interface GetWalletResponseDto {
  active_payout_method: ActivePayoutMethod | null
  user: WalletUserDto
}

export interface ActivateWalletResponseDto {
  success?: string
  user?: WalletUserDto
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

export interface WalletDepositPayload {
  deposit_amount: number | string
  payment_gateway: string
  confirmed: boolean
  deposit_option?: number
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