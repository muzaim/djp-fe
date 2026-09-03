import { refDebounced } from '@vueuse/core'
import { ActivityOutputService } from '@/services/activity-output.service'
import type {
  ActivityOutputItem,
  CreateActivityOutputPayload,
  UpdateActivityOutputPayload,
} from '@/services/types/activity-output.types'
import { extractErrorMessage } from '@/utils/error-mapper'

export function useActivityOutput() {
  const activityOutputs = ref<ActivityOutputItem[]>([])
  const totalOutputs = ref(0)
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
   * Fetch activity outputs via GET /activity-outputs with pagination and 400ms debounced search
   */
  const fetchActivityOutputs = async () => {
    isLoading.value = true
    try {
      const res = await ActivityOutputService.getActivityOutputs({
        page: page.value,
        limit: itemsPerPage.value,
        search: debouncedSearch.value,
      })

      const rawItems = res.data || []
      const startIndex = (page.value - 1) * itemsPerPage.value

      activityOutputs.value = rawItems.map((item, idx) => ({
        ...item,
        index: startIndex + idx + 1,
      }))

      totalOutputs.value = res.total || 0
    }
    catch (err: any) {
      console.error('Fetch activity outputs error:', err)
      snackBarText.value = extractErrorMessage(err)
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Open drawer for adding new activity output
   */
  const addData = () => {
    detailData.value = {
      name: '',
      description: '',
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
      const res = await ActivityOutputService.getActivityOutputById(id)
      detailData.value = res
      isAddNewDrawerVisible.value = true
    }
    catch (err: any) {
      console.error('Fetch activity output detail error:', err)
      snackBarText.value = extractErrorMessage(err)
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Save activity output (Create or Update)
   */
  const submitProcess = async (formData: any) => {
    isLoading.value = true
    try {
      if (formData.id) {
        const updatePayload: UpdateActivityOutputPayload = {
          id: String(formData.id),
          name: formData.name,
          description: formData.description || undefined,
          isActive: formData.isActive,
        }

        await ActivityOutputService.updateActivityOutput(updatePayload)
        snackBarText.value = 'Berhasil memperbarui data keluaran aktivitas!'
      }
      else {
        const createPayload: CreateActivityOutputPayload = {
          name: formData.name,
          description: formData.description || undefined,
          isActive: formData.isActive,
        }

        await ActivityOutputService.createActivityOutput(createPayload)
        snackBarText.value = 'Berhasil menambah keluaran aktivitas baru!'
      }

      snackBarColour.value = 'primary'
      isSnackbarVisible.value = true
      isAddNewDrawerVisible.value = false
      await fetchActivityOutputs()
    }
    catch (err: any) {
      console.error('Submit activity output error:', err)
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
   * Delete activity output upon confirmation
   */
  const deleteData = async (confirm: boolean) => {
    if (confirm && idDelete.value) {
      isLoading.value = true
      try {
        await ActivityOutputService.deleteActivityOutput(idDelete.value)
        snackBarText.value = 'Keluaran aktivitas berhasil dihapus!'
        snackBarColour.value = 'primary'
        isSnackbarVisible.value = true
        await fetchActivityOutputs()
      }
      catch (err: any) {
        console.error('Delete activity output error:', err)
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

  watch([page, itemsPerPage, debouncedSearch], () => {
    fetchActivityOutputs()
  })

  watch(searchQuery, () => {
    page.value = 1
  })

  onMounted(() => {
    fetchActivityOutputs()
  })

  return {
    activityOutputs,
    totalOutputs,
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
    fetchActivityOutputs,
    addData,
    selectData,
    submitProcess,
    updateDeleteData,
    deleteData,
  }
}
