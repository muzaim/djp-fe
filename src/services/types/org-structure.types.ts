export type OrgLevelType = 'COMPANY' | 'DIRECTORATE' | 'DIVISION' | 'DEPARTMENT' | 'SECTION'

export interface OrganizationUnitItem {
  id: string
  code: string
  name: string
  levelType: OrgLevelType | string
  parentId?: string | null
  parent?: OrganizationUnitItem | null
  children?: OrganizationUnitItem[]
  createdAt?: string
  updatedAt?: string
  index?: number
}

export interface CreateOrganizationUnitPayload {
  code: string
  name: string
  levelType: string
  parentId?: string
}

export interface UpdateOrganizationUnitPayload extends Partial<CreateOrganizationUnitPayload> {
  id: string
}

export interface DivisionItem {
  id: string
  code: string
  name: string
  levelType: string
  parentId?: string | null
}

export interface PositionItem {
  id: string
  title: string
  organizationUnitId: string
  jobLevelId: string
  parentPositionId?: string | null
  division?: DivisionItem
  organizationUnit?: {
    id: string
    code: string
    name: string
    levelType?: string
    parent?: DivisionItem | null
  }
}
