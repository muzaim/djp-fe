import type { AuditLogItem, AuditLogPaginationParams } from './types/audit-log.types'

export class AuditLogService {
  /**
   * Fetch paginated list of audit logs via GET /audit-logs
   */
  static async getAuditLogs(params?: AuditLogPaginationParams): Promise<{ data: AuditLogItem[]; total: number }> {
    const res = await $api('/audit-logs', {
      method: 'GET',
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        search: params?.search || '',
      },
    })

    const payload = res?.data || res
    let items: AuditLogItem[] = []
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
   * Fetch single audit log detail by ID via GET /audit-logs/:id
   */
  static async getAuditLogById(id: string): Promise<AuditLogItem> {
    const res = await $api(`/audit-logs/${id}`, {
      method: 'GET',
    })

    return res?.data || res
  }
}
