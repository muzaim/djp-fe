import { refDebounced } from '@vueuse/core'
import { ResponsibilityService } from '@/services/responsibility.service'
import type {
  ActivityItem,
  CreateActivityPayload,
  ResponsibilityItem,
  UpdateActivityPayload,
} from '@/services/types/responsibility.types'
import { extractErrorMessage } from '@/utils/error-mapper'

export function useActivity(responsibilityIdRef: Ref<string>) {
  const activities = ref<ActivityItem[]>([])
  const responsibilityDetail = ref<ResponsibilityItem | null>(null)
  const totalActivities = ref(0)
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
   * Fetch responsibility parent info and its child activities
   */
  const fetchActivities = async () => {
    if (!responsibilityIdRef.value)
      return

    isLoading.value = true
    try {
      // 1. Fetch parent Responsibility info
      const parentInfo = await ResponsibilityService.getResponsibilityById(responsibilityIdRef.value)
      responsibilityDetail.value = parentInfo

      // 2. Fetch Activities by responsibility ID
      const items = await ResponsibilityService.getActivitiesByResponsibility(responsibilityIdRef.value)

      // Filter by debounced search if typed
      let filtered = items
      if (debouncedSearch.value && debouncedSearch.value.trim() !== '') {
        const query = debouncedSearch.value.toLowerCase().trim()
        filtered = items.filter(act => act.name.toLowerCase().includes(query))
      }

      totalActivities.value = filtered.length

      // Manual client-side pagination slice for activities
      const start = (page.value - 1) * itemsPerPage.value
      const paginated = filtered.slice(start, start + itemsPerPage.value)

      activities.value = paginated.map((item, idx) => ({
        ...item,
        index: start + idx + 1,
      }))
    }
    catch (err: any) {
      console.error('Fetch activities error:', err)
      snackBarText.value = extractErrorMessage(err)
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Open drawer for adding a new activity
   */
  const addData = () => {
    detailData.value = {
      responsibilityId: responsibilityIdRef.value,
      name: '',
      isActive: true,
    }
    isAddNewDrawerVisible.value = true
  }

  /**
   * Select activity for editing
   */
  const selectData = (item: ActivityItem) => {
    detailData.value = {
      id: item.id,
      responsibilityId: item.responsibilityId || responsibilityIdRef.value,
      name: item.name,
      isActive: typeof item.isActive === 'boolean' ? item.isActive : true,
    }
    isAddNewDrawerVisible.value = true
  }

  /**
   * Save activity (Create or Update)
   */
  const submitProcess = async (formData: any) => {
    isLoading.value = true
    try {
      if (formData.id) {
        const updatePayload: UpdateActivityPayload = {
          id: String(formData.id),
          responsibilityId: responsibilityIdRef.value,
          name: formData.name,
          isActive: formData.isActive,
        }

        await ResponsibilityService.updateActivity(updatePayload)
        snackBarText.value = 'Berhasil memperbarui data aktivitas!'
      }
      else {
        const createPayload: CreateActivityPayload = {
          responsibilityId: responsibilityIdRef.value,
          name: formData.name,
          isActive: formData.isActive,
        }

        await ResponsibilityService.createActivity(createPayload)
        snackBarText.value = 'Berhasil menambah aktivitas baru!'
      }

      snackBarColour.value = 'primary'
      isSnackbarVisible.value = true
      isAddNewDrawerVisible.value = false
      await fetchActivities()
    }
    catch (err: any) {
      console.error('Submit activity error:', err)
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
   * Delete activity upon confirmation
   */
  const deleteData = async (confirm: boolean) => {
    if (confirm && idDelete.value) {
      isLoading.value = true
      try {
        await ResponsibilityService.deleteActivity(idDelete.value)
        snackBarText.value = 'Aktivitas berhasil dihapus!'
        snackBarColour.value = 'primary'
        isSnackbarVisible.value = true
        await fetchActivities()
      }
      catch (err: any) {
        console.error('Delete activity error:', err)
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

  watch([responsibilityIdRef, page, itemsPerPage, debouncedSearch], () => {
    fetchActivities()
  })

  watch(searchQuery, () => {
    page.value = 1
  })

  onMounted(() => {
    fetchActivities()
  })

  return {
    activities,
    responsibilityDetail,
    totalActivities,
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
    fetchActivities,
    addData,
    selectData,
    submitProcess,
    updateDeleteData,
    deleteData,
  }
}
