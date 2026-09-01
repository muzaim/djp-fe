export interface LoginCredentials {
  email: string
  password: string
}

export interface UserPosition {
  id: string
  title: string
  jobLevel: string | null
  organizationUnit: string | null
  division: string | null
}

export interface UserProfileData {
  id: string
  name: string
  email: string
  phoneNumber: string | null
  isActive: boolean
  position: UserPosition | null
  roles: string[]
}

export interface LoginResponseData {
  accessToken: string
  tokenType: string
  user: UserProfileData
}
