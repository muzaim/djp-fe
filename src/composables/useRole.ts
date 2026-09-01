import { refDebounced } from '@vueuse/core'
import { RoleService } from '@/services/role.service'
import type { RoleItem } from '@/services/types/role.types'

export function useRole() {
  const roles = ref<RoleItem[]>([])
  const totalRoles = ref(0)
  const isLoading = ref(false)

  const searchQuery = ref('')
  const debouncedSearch = refDebounced(searchQuery, 400)
  const itemsPerPage = ref(10)
  const page = ref(1)

  const isSnackbarVisible = ref(false)
  const snackBarText = ref('')
  const snackBarColour = ref('')

  /**
   * Fetch roles list safely
   */
  const fetchRoles = async () => {
    isLoading.value = true
    try {
      const res = await RoleService.getRoles({
        page: page.value,
        limit: itemsPerPage.value,
        search: debouncedSearch.value,
      })

      const rawItems = res?.data || []
      roles.value = rawItems.map((item, index) => ({
        ...item,
        index: (page.value - 1) * itemsPerPage.value + index + 1,
      }))

      totalRoles.value = res?.total || rawItems.length
    }
    catch (err: any) {
      console.error('Fetch roles error:', err)
      roles.value = []
      totalRoles.value = 0
      snackBarText.value = err?.message || 'Failed to fetch roles'
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  watch(searchQuery, () => {
    page.value = 1
  })

  watch([page, itemsPerPage, debouncedSearch], () => {
    fetchRoles()
  })

  onMounted(() => {
    fetchRoles()
  })

  return {
    roles,
    totalRoles,
    isLoading,
    searchQuery,
    itemsPerPage,
    page,
    isSnackbarVisible,
    snackBarText,
    snackBarColour,
    fetchRoles,
  }
}
