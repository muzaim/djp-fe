export interface AuditLogItem {
  id: string
  userId?: string | null
  userEmail?: string | null
  action: string
  method: string
  path: string
  ipAddress?: string | null
  userAgent?: string | null
  payload?: any
  statusCode?: number | null
  createdAt: string
}

export interface AuditLogPaginationParams {
  page?: number
  limit?: number
  search?: string
}
