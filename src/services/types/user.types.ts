export interface UserPositionInfo {
  id: string
  title: string
  organizationUnit?: any
  jobLevel?: any
}

export interface UserItem {
  id: string
  name: string
  email: string
  phoneNumber: string | null
  isActive: boolean
  positionId: string | null
  position: UserPositionInfo | null
  userRoles: any[]
  createdAt?: string
  updatedAt?: string
  // Virtual UI helpers
  index?: number
}

export interface UserQueryParams {
  page?: number
  limit?: number
  search?: string
}

export interface CreateUserPayload {
  name: string
  email: string
  password?: string
  phoneNumber?: string
  positionId?: string
  roleIds?: string[]
  isActive?: boolean
}

export interface UpdateUserPayload extends Partial<CreateUserPayload> {
  id: string
}
