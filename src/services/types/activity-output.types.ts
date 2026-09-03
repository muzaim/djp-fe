export interface ActivityOutputItem {
  id: string
  name: string
  description?: string | null
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateActivityOutputPayload {
  name: string
  description?: string
  isActive?: boolean
}

export interface UpdateActivityOutputPayload {
  id: string
  name?: string
  description?: string
  isActive?: boolean
}
