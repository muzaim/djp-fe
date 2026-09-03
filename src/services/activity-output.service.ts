import type {
  ActivityOutputItem,
  CreateActivityOutputPayload,
  UpdateActivityOutputPayload,
} from './types/activity-output.types'

export class ActivityOutputService {
  /**
   * Fetch paginated list of Activity Outputs via GET /activity-outputs
   */
  static async getActivityOutputs(params?: { page?: number; limit?: number; search?: string }): Promise<{ data: ActivityOutputItem[]; total: number }> {
    const res = await $api('/activity-outputs', {
      method: 'GET',
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        search: params?.search || '',
      },
    })

    const payload = res?.data || res
    let items: ActivityOutputItem[] = []
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
   * Get single Activity Output detail by ID via GET /activity-outputs/:id
   */
  static async getActivityOutputById(id: string): Promise<ActivityOutputItem> {
    const res = await $api(`/activity-outputs/${id}`, {
      method: 'GET',
    })

    return res?.data || res
  }

  /**
   * Create new Activity Output via POST /activity-outputs
   */
  static async createActivityOutput(payload: CreateActivityOutputPayload): Promise<ActivityOutputItem> {
    const res = await $api('/activity-outputs', {
      method: 'POST',
      body: payload,
    })

    return res?.data || res
  }

  /**
   * Update Activity Output via PATCH /activity-outputs/:id
   */
  static async updateActivityOutput(payload: UpdateActivityOutputPayload): Promise<ActivityOutputItem> {
    const { id, ...body } = payload

    const res = await $api(`/activity-outputs/${id}`, {
      method: 'PATCH',
      body,
    })

    return res?.data || res
  }

  /**
   * Delete Activity Output via DELETE /activity-outputs/:id
   */
  static async deleteActivityOutput(id: string): Promise<void> {
    await $api(`/activity-outputs/${id}`, {
      method: 'DELETE',
    })
  }
}
