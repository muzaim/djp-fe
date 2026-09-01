import type { RoleItem } from './types/role.types'

export class RoleService {
  /**
   * Fetch paginated list of roles via GET /roles
   */
  static async getRoles(params?: { page?: number; limit?: number; search?: string }): Promise<{ data: RoleItem[]; total: number }> {
    const res = await $api('/roles', {
      method: 'GET',
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        search: params?.search || '',
      },
    })

    const payload = res?.data || res
    let items: RoleItem[] = []
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
   * Get single role detail by ID via GET /roles/:id
   */
  static async getRoleById(id: string): Promise<RoleItem> {
    const res = await $api(`/roles/${id}`, {
      method: 'GET',
    })

    return res?.data || res
  }
}
