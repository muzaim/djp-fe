import type { PositionItem } from './org-structure.types'

export interface ActivityItem {
  id: string
  responsibilityId: string
  name: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface ResponsibilityItem {
  id: string
  positionId: string
  code?: string | null
  name: string
  isActive?: boolean
  position?: PositionItem
  activities?: ActivityItem[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateResponsibilityPayload {
  positionId: string
  code?: string
  name: string
  isActive?: boolean
}

export interface UpdateResponsibilityPayload {
  id: string
  positionId?: string
  code?: string
  name?: string
  isActive?: boolean
}

export interface CreateActivityPayload {
  responsibilityId: string
  name: string
  isActive?: boolean
}

export interface UpdateActivityPayload {
  id: string
  responsibilityId?: string
  name?: string
  isActive?: boolean
}
