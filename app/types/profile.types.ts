// app/types/profile.types.ts

export interface UpdateProfilePayload {
  id: number
  first_name: string
  last_name: string
  national_id: string
  email: string
  birthday: string
  gender: number | null
  address: string | null
  ImageUrl: string | null
}

export interface UpdateProfileUserData {
  id: number
  first_name: string
  last_name: string
  national_id: string
  mobile: string
  balance: number
  birthday: string
  user_name: string | null
  email: string
  gender: number | null
  ImageUrl: string | null
  is_organization: boolean
  IsActive: boolean
  avatar: string | null
}

export interface UpdateProfileResponse {
  message: string
  change_data: string[]
  userData: UpdateProfileUserData
}

export interface UploadAvatarResponse {
  message?: string
  ImageUrl?: string
  image_url?: string
  avatar?: { image_url?: string } | null
}