import { refDebounced } from '@vueuse/core'
import { ResponsibilityService } from '@/services/responsibility.service'
import type {
  CreateResponsibilityPayload,
  ResponsibilityItem,
  UpdateResponsibilityPayload,
} from '@/services/types/responsibility.types'
import { extractErrorMessage } from '@/utils/error-mapper'

export function useResponsibility() {
  const responsibilities = ref<ResponsibilityItem[]>([])
  const totalResponsibilities = ref(0)
  const isLoading = ref(false)
  const isExporting = ref(false)

  const searchQuery = ref('')
  const debouncedSearch = refDebounced(searchQuery, 400)
  const itemsPerPage = ref(10)
  const page = ref(1)

  // Advanced Filter state
  const filterDivisionId = ref('')
  const filterDepartmentId = ref('')
  const filterPositionId = ref('')
  const isFilterPanelOpen = ref(false)

  const isSnackbarVisible = ref(false)
  const snackBarText = ref('')
  const snackBarColour = ref('')

  const isAddNewDrawerVisible = ref(false)
  const isConfirmDialogOpen = ref(false)
  const idDelete = ref<string>('')
  const detailData = ref<any>(null)

  // Active filters count
  const activeFiltersCount = computed(() => {
    let count = 0
    if (filterDivisionId.value)
      count++
    if (filterDepartmentId.value)
      count++
    if (filterPositionId.value)
      count++
    return count
  })

  // Clear all filters
  const resetFilters = () => {
    filterDivisionId.value = ''
    filterDepartmentId.value = ''
    filterPositionId.value = ''
    page.value = 1
  }

  /**
   * Fetch responsibilities via GET /responsibilities with search and advanced filters
   */
  const fetchResponsibilities = async () => {
    isLoading.value = true
    try {
      const res = await ResponsibilityService.getResponsibilities({
        page: page.value,
        limit: itemsPerPage.value,
        search: debouncedSearch.value,
        divisionId: filterDivisionId.value || undefined,
        departmentId: filterDepartmentId.value || undefined,
        positionId: filterPositionId.value || undefined,
      })

      const rawItems = res.data || []
      const startIndex = (page.value - 1) * itemsPerPage.value

      responsibilities.value = rawItems.map((item, idx) => ({
        ...item,
        index: startIndex + idx + 1,
      }))

      totalResponsibilities.value = res.total || 0
    }
    catch (err: any) {
      console.error('Fetch responsibilities error:', err)
      snackBarText.value = extractErrorMessage(err)
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Export responsibilities data to Excel file (.xlsx)
   */
  const exportData = async () => {
    isExporting.value = true
    try {
      const blob = await ResponsibilityService.exportToExcel({
        search: debouncedSearch.value || undefined,
        divisionId: filterDivisionId.value || undefined,
        departmentId: filterDepartmentId.value || undefined,
        positionId: filterPositionId.value || undefined,
      })

      const dateStr = new Date().toISOString().slice(0, 10)
      const fileName = `Master_Tanggung_Jawab_${dateStr}.xlsx`

      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileName)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      snackBarText.value = 'Berhasil mengekspor data tanggung jawab ke Excel!'
      snackBarColour.value = 'success'
      isSnackbarVisible.value = true
    }
    catch (err: any) {
      console.error('Export responsibility error:', err)
      snackBarText.value = extractErrorMessage(err) || 'Gagal mengekspor data tanggung jawab!'
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isExporting.value = false
    }
  }

  /**
   * Open drawer for adding new responsibility
   */
  const addData = () => {
    detailData.value = {
      positionId: '',
      code: '',
      name: '',
      isActive: true,
    }
    isAddNewDrawerVisible.value = true
  }

  /**
   * Fetch detail and open drawer for editing
   */
  const selectData = async (id: string) => {
    isLoading.value = true
    try {
      const res = await ResponsibilityService.getResponsibilityById(id)
      detailData.value = res
      isAddNewDrawerVisible.value = true
    }
    catch (err: any) {
      console.error('Fetch responsibility detail error:', err)
      snackBarText.value = extractErrorMessage(err)
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Save responsibility (Create or Update)
   */
  const submitProcess = async (formData: any) => {
    isLoading.value = true
    try {
      if (formData.id) {
        const updatePayload: UpdateResponsibilityPayload = {
          id: String(formData.id),
          positionId: String(formData.positionId),
          code: formData.code || undefined,
          name: formData.name,
          isActive: formData.isActive,
        }

        await ResponsibilityService.updateResponsibility(updatePayload)
        snackBarText.value = 'Berhasil memperbarui data tanggung jawab!'
      }
      else {
        const createPayload: CreateResponsibilityPayload = {
          positionId: String(formData.positionId),
          code: formData.code || undefined,
          name: formData.name,
          isActive: formData.isActive,
        }

        await ResponsibilityService.createResponsibility(createPayload)
        snackBarText.value = 'Berhasil menambah tanggung jawab baru!'
      }

      snackBarColour.value = 'primary'
      isSnackbarVisible.value = true
      isAddNewDrawerVisible.value = false
      await fetchResponsibilities()
    }
    catch (err: any) {
      console.error('Submit responsibility error:', err)
      snackBarText.value = extractErrorMessage(err)
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  const updateDeleteData = (id: string) => {
    idDelete.value = id
  }

  /**
   * Delete responsibility upon confirmation
   */
  const deleteData = async (confirm: boolean) => {
    if (confirm && idDelete.value) {
      isLoading.value = true
      try {
        await ResponsibilityService.deleteResponsibility(idDelete.value)
        snackBarText.value = 'Tanggung jawab berhasil dihapus!'
        snackBarColour.value = 'primary'
        isSnackbarVisible.value = true
        await fetchResponsibilities()
      }
      catch (err: any) {
        console.error('Delete responsibility error:', err)
        snackBarText.value = extractErrorMessage(err)
        snackBarColour.value = 'error'
        isSnackbarVisible.value = true
      }
      finally {
        isLoading.value = false
      }
    }
    idDelete.value = ''
  }

  watch([page, itemsPerPage, debouncedSearch, filterDivisionId, filterDepartmentId, filterPositionId], () => {
    fetchResponsibilities()
  })

  watch([searchQuery, filterDivisionId, filterDepartmentId, filterPositionId], () => {
    page.value = 1
  })

  onMounted(() => {
    fetchResponsibilities()
  })

  return {
    responsibilities,
    totalResponsibilities,
    isLoading,
    isExporting,
    searchQuery,
    itemsPerPage,
    page,
    filterDivisionId,
    filterDepartmentId,
    filterPositionId,
    isFilterPanelOpen,
    activeFiltersCount,
    resetFilters,
    isSnackbarVisible,
    snackBarText,
    snackBarColour,
    isAddNewDrawerVisible,
    isConfirmDialogOpen,
    detailData,
    fetchResponsibilities,
    exportData,
    addData,
    selectData,
    submitProcess,
    updateDeleteData,
    deleteData,
  }
}
