import type {
  ActivityItem,
  CreateActivityPayload,
  CreateResponsibilityPayload,
  ResponsibilityItem,
  UpdateActivityPayload,
  UpdateResponsibilityPayload,
} from './types/responsibility.types'

export class ResponsibilityService {
  /**
   * Fetch paginated list of Responsibilities via GET /responsibilities with advanced filters
   */
  static async getResponsibilities(params?: {
    page?: number
    limit?: number
    search?: string
    divisionId?: string
    departmentId?: string
    positionId?: string
  }): Promise<{ data: ResponsibilityItem[]; total: number }> {
    const queryParams: Record<string, any> = {
      page: params?.page || 1,
      limit: params?.limit || 10,
      search: params?.search || '',
    }

    if (params?.divisionId)
      queryParams.divisionId = params.divisionId
    if (params?.departmentId)
      queryParams.departmentId = params.departmentId
    if (params?.positionId)
      queryParams.positionId = params.positionId

    const res = await $api('/responsibilities', {
      method: 'GET',
      params: queryParams,
    })

    const payload = res?.data || res
    let items: ResponsibilityItem[] = []
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
   * Export responsibilities to Excel file via GET /responsibilities/export
   */
  static async exportToExcel(params?: {
    search?: string
    divisionId?: string
    departmentId?: string
    positionId?: string
  }): Promise<Blob> {
    const queryParams: Record<string, any> = {}

    if (params?.search)
      queryParams.search = params.search
    if (params?.divisionId)
      queryParams.divisionId = params.divisionId
    if (params?.departmentId)
      queryParams.departmentId = params.departmentId
    if (params?.positionId)
      queryParams.positionId = params.positionId

    const res = await $api('/responsibilities/export', {
      method: 'GET',
      responseType: 'blob',
      params: queryParams,
    })

    return res
  }

  /**
   * Get single Responsibility detail by ID via GET /responsibilities/:id
   */
  static async getResponsibilityById(id: string): Promise<ResponsibilityItem> {
    const res = await $api(`/responsibilities/${id}`, {
      method: 'GET',
    })

    return res?.data || res
  }

  /**
   * Create new Responsibility via POST /responsibilities
   */
  static async createResponsibility(payload: CreateResponsibilityPayload): Promise<ResponsibilityItem> {
    const res = await $api('/responsibilities', {
      method: 'POST',
      body: payload,
    })

    return res?.data || res
  }

  /**
   * Update Responsibility via PATCH /responsibilities/:id
   */
  static async updateResponsibility(payload: UpdateResponsibilityPayload): Promise<ResponsibilityItem> {
    const { id, ...body } = payload

    const res = await $api(`/responsibilities/${id}`, {
      method: 'PATCH',
      body,
    })

    return res?.data || res
  }

  /**
   * Delete Responsibility via DELETE /responsibilities/:id
   */
  static async deleteResponsibility(id: string): Promise<void> {
    await $api(`/responsibilities/${id}`, {
      method: 'DELETE',
    })
  }

  // ===================== ACTIVITIES API =====================

  /**
   * Fetch activities belonging to a Responsibility ID via GET /activities/by-responsibility/:responsibilityId
   */
  static async getActivitiesByResponsibility(responsibilityId: string): Promise<ActivityItem[]> {
    if (!responsibilityId)
      return []

    const res = await $api(`/activities/by-responsibility/${responsibilityId}`, {
      method: 'GET',
    })

    const payload = res?.data || res
    return Array.isArray(payload) ? payload : (payload?.items || [])
  }

  /**
   * Create new Activity via POST /activities
   */
  static async createActivity(payload: CreateActivityPayload): Promise<ActivityItem> {
    const res = await $api('/activities', {
      method: 'POST',
      body: payload,
    })

    return res?.data || res
  }

  /**
   * Update Activity via PATCH /activities/:id
   */
  static async updateActivity(payload: UpdateActivityPayload): Promise<ActivityItem> {
    const { id, ...body } = payload

    const res = await $api(`/activities/${id}`, {
      method: 'PATCH',
      body,
    })

    return res?.data || res
  }

  /**
   * Delete Activity via DELETE /activities/:id
   */
  static async deleteActivity(id: string): Promise<void> {
    await $api(`/activities/${id}`, {
      method: 'DELETE',
    })
  }
}
