import type { CreatePositionPayload, PositionItem, UpdatePositionPayload } from './types/position.types'

export class PositionService {
  /**
   * Fetch paginated list of positions (Fungsi) via GET /positions
   */
  static async getPositions(params?: { page?: number; limit?: number; search?: string }): Promise<{ data: PositionItem[]; total: number }> {
    const res = await $api('/positions', {
      method: 'GET',
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        search: params?.search || '',
      },
    })

    const payload = res?.data || res
    let items: PositionItem[] = []
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
   * Get single position detail by ID via GET /positions/:id
   */
  static async getPositionById(id: string): Promise<PositionItem> {
    const res = await $api(`/positions/${id}`, {
      method: 'GET',
    })

    return res?.data || res
  }

  /**
   * Create new position via POST /positions
   */
  static async createPosition(payload: CreatePositionPayload): Promise<PositionItem> {
    const res = await $api('/positions', {
      method: 'POST',
      body: payload,
    })

    return res?.data || res
  }

  /**
   * Update position via PATCH /positions/:id
   */
  static async updatePosition(payload: UpdatePositionPayload): Promise<PositionItem> {
    const { id, ...body } = payload

    const res = await $api(`/positions/${id}`, {
      method: 'PATCH',
      body,
    })

    return res?.data || res
  }

  /**
   * Soft delete position via DELETE /positions/:id
   */
  static async deletePosition(id: string): Promise<void> {
    await $api(`/positions/${id}`, {
      method: 'DELETE',
    })
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
}
