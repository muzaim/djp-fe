import { refDebounced } from '@vueuse/core'
import { AuditLogService } from '@/services/audit-log.service'
import type { AuditLogItem } from '@/services/types/audit-log.types'
import { extractErrorMessage } from '@/utils/error-mapper'

export function useAuditLog() {
  const auditLogs = ref<AuditLogItem[]>([])
  const totalAuditLogs = ref(0)
  const isLoading = ref(false)

  const searchQuery = ref('')
  const debouncedSearch = refDebounced(searchQuery, 400)
  const itemsPerPage = ref(10)
  const page = ref(1)

  const isSnackbarVisible = ref(false)
  const snackBarText = ref('')
  const snackBarColour = ref('')

  const isDetailModalOpen = ref(false)
  const detailData = ref<AuditLogItem | null>(null)

  /**
   * Fetch audit logs via GET /audit-logs with 400ms debounced search
   */
  const fetchAuditLogs = async () => {
    isLoading.value = true
    try {
      const res = await AuditLogService.getAuditLogs({
        page: page.value,
        limit: itemsPerPage.value,
        search: debouncedSearch.value,
      })

      const rawItems = res.data || []
      const startIndex = (page.value - 1) * itemsPerPage.value

      auditLogs.value = rawItems.map((item, idx) => ({
        ...item,
        index: startIndex + idx + 1,
      }))

      totalAuditLogs.value = res.total || 0
    }
    catch (err: any) {
      console.error('Fetch audit logs error:', err)
      snackBarText.value = extractErrorMessage(err)
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Fetch single audit log detail and open modal
   */
  const selectData = async (id: string) => {
    isLoading.value = true
    try {
      const res = await AuditLogService.getAuditLogById(id)
      detailData.value = res
      isDetailModalOpen.value = true
    }
    catch (err: any) {
      console.error('Fetch audit log detail error:', err)
      snackBarText.value = extractErrorMessage(err)
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  watch([page, itemsPerPage, debouncedSearch], () => {
    fetchAuditLogs()
  })

  watch(searchQuery, () => {
    page.value = 1
  })

  onMounted(() => {
    fetchAuditLogs()
  })

  return {
    auditLogs,
    totalAuditLogs,
    isLoading,
    searchQuery,
    itemsPerPage,
    page,
    isSnackbarVisible,
    snackBarText,
    snackBarColour,
    isDetailModalOpen,
    detailData,
    fetchAuditLogs,
    selectData,
  }
}
