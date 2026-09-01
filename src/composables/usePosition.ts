import { refDebounced } from '@vueuse/core'
import { PositionService } from '@/services/position.service'
import type { CreatePositionPayload, PositionItem, UpdatePositionPayload } from '@/services/types/position.types'

export function usePosition() {
  const positions = ref<PositionItem[]>([])
  const totalPositions = ref(0)
  const isLoading = ref(false)

  const searchQuery = ref('')
  const debouncedSearch = refDebounced(searchQuery, 400)
  const itemsPerPage = ref(10)
  const page = ref(1)

  const isSnackbarVisible = ref(false)
  const snackBarText = ref('')
  const snackBarColour = ref('')

  const isAddNewDrawerVisible = ref(false)
  const isConfirmDialogOpen = ref(false)
  const idDelete = ref<string>('')
  const detailData = ref<any>(null)

  /**
   * Fetch paginated list of positions (Fungsi)
   */
  const fetchPositions = async () => {
    isLoading.value = true
    try {
      const res = await PositionService.getPositions({
        page: page.value,
        limit: itemsPerPage.value,
        search: debouncedSearch.value,
      })

      positions.value = res.data.map((item, index) => ({
        ...item,
        index: (page.value - 1) * itemsPerPage.value + index + 1,
      }))

      totalPositions.value = res.total
    }
    catch (err: any) {
      console.error('Fetch positions error:', err)
      snackBarText.value = err?.message || 'Failed to fetch positions'
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Open drawer for adding a new position
   */
  const addData = () => {
    detailData.value = {
      title: '',
      organizationUnitId: '',
      jobLevelId: '',
      parentPositionId: undefined,
    }
    isAddNewDrawerVisible.value = true
  }

  /**
   * Fetch detail and open drawer for editing
   */
  const selectData = async (id: string) => {
    isLoading.value = true
    try {
      const res = await PositionService.getPositionById(id)
      detailData.value = res
      isAddNewDrawerVisible.value = true
    }
    catch (err: any) {
      console.error('Fetch position detail error:', err)
      snackBarText.value = 'Failed to fetch position detail'
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Save position (Create or Update)
   */
  const submitProcess = async (formData: any) => {
    isLoading.value = true
    try {
      if (formData.id) {
        const updatePayload: UpdatePositionPayload = {
          id: String(formData.id),
          title: formData.title,
          organizationUnitId: formData.organizationUnitId,
          jobLevelId: formData.jobLevelId,
          parentPositionId: formData.parentPositionId || undefined,
        }

        await PositionService.updatePosition(updatePayload)
        snackBarText.value = 'Success, Update data fungsi!'
      }
      else {
        const createPayload: CreatePositionPayload = {
          title: formData.title,
          organizationUnitId: formData.organizationUnitId,
          jobLevelId: formData.jobLevelId,
          parentPositionId: formData.parentPositionId || undefined,
        }

        await PositionService.createPosition(createPayload)
        snackBarText.value = 'Success, Tambah data fungsi!'
      }

      snackBarColour.value = 'primary'
      isSnackbarVisible.value = true
      isAddNewDrawerVisible.value = false
      await fetchPositions()
    }
    catch (err: any) {
      console.error('Submit position error:', err)
      const msg = err?.data?.message || err?.message || 'Error, Please check input values'
      snackBarText.value = Array.isArray(msg) ? msg.join(', ') : msg
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
   * Delete position upon confirmation
   */
  const deleteData = async (confirm: boolean) => {
    if (confirm && idDelete.value) {
      isLoading.value = true
      try {
        await PositionService.deletePosition(idDelete.value)
        snackBarText.value = 'Fungsi berhasil dihapus!'
        snackBarColour.value = 'primary'
        isSnackbarVisible.value = true
        await fetchPositions()
      }
      catch (err: any) {
        console.error('Delete position error:', err)
        snackBarText.value = err?.message || 'Failed to delete position'
        snackBarColour.value = 'error'
        isSnackbarVisible.value = true
      }
      finally {
        isLoading.value = false
      }
    }
    idDelete.value = ''
  }

  watch(searchQuery, () => {
    page.value = 1
  })

  watch([page, itemsPerPage, debouncedSearch], () => {
    fetchPositions()
  })

  onMounted(() => {
    fetchPositions()
  })

  return {
    positions,
    totalPositions,
    isLoading,
    searchQuery,
    itemsPerPage,
    page,
    isSnackbarVisible,
    snackBarText,
    snackBarColour,
    isAddNewDrawerVisible,
    isConfirmDialogOpen,
    detailData,
    fetchPositions,
    addData,
    selectData,
    submitProcess,
    updateDeleteData,
    deleteData,
  }
}
