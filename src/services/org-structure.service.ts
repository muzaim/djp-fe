import type {
  CreateOrganizationUnitPayload,
  DivisionItem,
  OrganizationUnitItem,
  PositionItem,
  UpdateOrganizationUnitPayload,
} from './types/org-structure.types'

export class OrgStructureService {
  /**
   * Fetch paginated list of organization units via GET /organization-units
   */
  static async getOrganizationUnits(params?: { page?: number; limit?: number; search?: string }): Promise<{ data: OrganizationUnitItem[]; total: number }> {
    const res = await $api('/organization-units', {
      method: 'GET',
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        search: params?.search || '',
      },
    })

    const payload = res?.data || res
    let items: OrganizationUnitItem[] = []
    let total = 0

    if (payload?.items && Array.isArray(payload.items)) {
      items = payload.items
      total = payload?.meta?.totalItems || payload?.meta?.total || items.length
    }
    else if (Array.isArray(payload)) {
      items = payload
      total = items.length
    }
    else if (payload?.data && Array.isArray(payload.data)) {
      items = payload.data
      total = payload?.totalItems || payload?.total || items.length
    }

    return {
      data: items,
      total,
    }
  }

  /**
   * Get single organization unit detail by ID via GET /organization-units/:id
   */
  static async getOrganizationUnitById(id: string): Promise<OrganizationUnitItem> {
    const res = await $api(`/organization-units/${id}`, {
      method: 'GET',
    })

    return res?.data || res
  }

  /**
   * Create new organization unit via POST /organization-units
   */
  static async createOrganizationUnit(payload: CreateOrganizationUnitPayload): Promise<OrganizationUnitItem> {
    const res = await $api('/organization-units', {
      method: 'POST',
      body: payload,
    })

    return res?.data || res
  }

  /**
   * Update organization unit via PATCH /organization-units/:id
   */
  static async updateOrganizationUnit(payload: UpdateOrganizationUnitPayload): Promise<OrganizationUnitItem> {
    const { id, ...body } = payload

    const res = await $api(`/organization-units/${id}`, {
      method: 'PATCH',
      body,
    })

    return res?.data || res
  }

  /**
   * Delete organization unit via DELETE /organization-units/:id
   */
  static async deleteOrganizationUnit(id: string): Promise<void> {
    await $api(`/organization-units/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Fetch all divisions (levelType DIVISION) via GET /organization-units/divisions
   */
  static async getDivisions(): Promise<DivisionItem[]> {
    const res = await $api('/organization-units/divisions', {
      method: 'GET',
    })

    const payload = res?.data || res
    return Array.isArray(payload) ? payload : (payload?.items || [])
  }

  /**
   * Fetch positions by Division ID via GET /positions/by-division/:divisionId
   */
  static async getPositionsByDivision(divisionId: string): Promise<PositionItem[]> {
    if (!divisionId)
      return []

    const res = await $api(`/positions/by-division/${divisionId}`, {
      method: 'GET',
    })

    const payload = res?.data || res
    return Array.isArray(payload) ? payload : (payload?.items || [])
  }

  /**
   * Fetch all positions via GET /positions
   */
  static async getAllPositions(): Promise<PositionItem[]> {
    const res = await $api('/positions', {
      method: 'GET',
      params: { limit: 100 },
    })

    const payload = res?.data || res
    return Array.isArray(payload) ? payload : (payload?.items || [])
  }
}
