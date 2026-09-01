export interface PositionItem {
  id: string
  title: string
  organizationUnitId: string
  jobLevelId: string
  parentPositionId?: string | null
  organizationUnit?: {
    id: string
    code: string
    name: string
    levelType?: string
    parent?: any
  }
  division?: {
    id: string
    code: string
    name: string
  }
  jobLevel?: {
    id: string
    code: string
    name: string
    rankWeight?: number
  }
  parentPosition?: PositionItem | null
  createdAt?: string
  updatedAt?: string
  index?: number
}

export interface CreatePositionPayload {
  title: string
  organizationUnitId: string
  jobLevelId: string
  parentPositionId?: string
}

export interface UpdatePositionPayload extends Partial<CreatePositionPayload> {
  id: string
}
