import { refDebounced } from '@vueuse/core'
import { UserService } from '@/services/user.service'
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserItem,
} from '@/services/types/user.types'

export function useUserManagement() {
  const users = ref<UserItem[]>([])
  const totalUsers = ref(0)
  const isLoading = ref(false)

  const searchQuery = ref('')
  const debouncedSearch = refDebounced(searchQuery, 400)
  const itemsPerPage = ref(10)
  const page = ref(1)

  const isSnackbarVisible = ref(false)
  const snackBarText = ref('')
  const snackBarColour = ref('')

  const isAddNewUserDrawerVisible = ref(false)
  const isConfirmDialogOpen = ref(false)
  const isResetPasswordDialogOpen = ref(false)
  const idDelete = ref<string>('')
  const idResetPassword = ref<string>('')
  const detailData = ref<any>(null)

  /**
   * Fetch users list via GET /users with pagination and search query
   */
  const fetchUsers = async () => {
    isLoading.value = true
    try {
      const res = await UserService.getUsers({
        page: page.value,
        limit: itemsPerPage.value,
        search: debouncedSearch.value,
      })

      const rawItems = res.data || []
      const startIndex = (page.value - 1) * itemsPerPage.value

      users.value = rawItems.map((item, idx) => ({
        ...item,
        index: startIndex + idx + 1,
      }))

      totalUsers.value = res.total || 0
    }
    catch (err: any) {
      console.error('Fetch users error:', err)
      snackBarText.value = err?.message || 'Failed to fetch users list'
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Open drawer for adding a new user
   */
  const addData = () => {
    detailData.value = {
      name: '',
      email: '',
      positionId: '',
      roleIds: [],
      isActive: true,
    }
    isAddNewUserDrawerVisible.value = true
  }

  /**
   * Fetch user details and open drawer for editing
   */
  const selectData = async (id: string) => {
    isLoading.value = true
    try {
      const res = await UserService.getUserById(id)
      detailData.value = res
      isAddNewUserDrawerVisible.value = true
    }
    catch (err: any) {
      console.error('Fetch user detail error:', err)
      snackBarText.value = 'Failed to fetch user details'
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Save user (Create or Update) sending roleIds array supporting multiple roles
   */
  const submitProcess = async (formData: any) => {
    isLoading.value = true
    try {
      const roleIds = Array.isArray(formData.roleIds)
        ? formData.roleIds.map(String)
        : (formData.roleId || formData.id_roles ? [String(formData.roleId || formData.id_roles)] : [])

      if (formData.id) {
        const updatePayload: UpdateUserPayload = {
          id: String(formData.id),
          name: formData.name || formData.full_name,
          email: formData.email,
        }

        if (formData.positionId || formData.id_msso) {
          updatePayload.positionId = formData.positionId || formData.id_msso
        }
        if (roleIds.length > 0) {
          updatePayload.roleIds = roleIds
        }

        await UserService.updateUser(updatePayload)
        snackBarText.value = 'Berhasil memperbarui data user!'
      }
      else {
        const createPayload: CreateUserPayload = {
          name: formData.name || formData.full_name,
          email: formData.email,
        }

        if (formData.positionId || formData.id_msso) {
          createPayload.positionId = formData.positionId || formData.id_msso
        }
        if (roleIds.length > 0) {
          createPayload.roleIds = roleIds
        }

        await UserService.createUser(createPayload)
        snackBarText.value = 'Berhasil menambah user baru!'
      }

      snackBarColour.value = 'primary'
      isSnackbarVisible.value = true
      isAddNewUserDrawerVisible.value = false
      await fetchUsers()
    }
    catch (err: any) {
      console.error('Submit user error:', err)
      const msg = err?.data?.message || err?.message || 'Error, silakan periksa kembali data masukan'
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
   * Delete user upon confirmation
   */
  const deleteData = async (confirm: boolean) => {
    if (confirm && idDelete.value) {
      isLoading.value = true
      try {
        await UserService.deleteUser(idDelete.value)
        snackBarText.value = 'User berhasil dihapus!'
        snackBarColour.value = 'primary'
        isSnackbarVisible.value = true
        await fetchUsers()
      }
      catch (err: any) {
        console.error('Delete user error:', err)
        snackBarText.value = err?.message || 'Gagal menghapus user'
        snackBarColour.value = 'error'
        isSnackbarVisible.value = true
      }
      finally {
        isLoading.value = false
      }
    }
    idDelete.value = ''
  }

  const openResetPasswordDialog = (id: string) => {
    idResetPassword.value = id
    isResetPasswordDialogOpen.value = true
  }

  /**
   * Reset user password to default (12345)
   */
  const resetPassword = async (confirm: boolean) => {
    if (confirm && idResetPassword.value) {
      isLoading.value = true
      try {
        await UserService.resetPassword(idResetPassword.value)
        snackBarText.value = 'Password user berhasil di-reset menjadi 12345!'
        snackBarColour.value = 'primary'
        isSnackbarVisible.value = true
      }
      catch (err: any) {
        console.error('Reset password error:', err)
        snackBarText.value = err?.message || 'Gagal me-reset password user'
        snackBarColour.value = 'error'
        isSnackbarVisible.value = true
      }
      finally {
        isLoading.value = false
      }
    }
    idResetPassword.value = ''
  }

  watch([page, itemsPerPage, debouncedSearch], () => {
    fetchUsers()
  })

  watch(searchQuery, () => {
    page.value = 1
  })

  onMounted(() => {
    fetchUsers()
  })

  return {
    users,
    totalUsers,
    isLoading,
    searchQuery,
    itemsPerPage,
    page,
    isSnackbarVisible,
    snackBarText,
    snackBarColour,
    isAddNewUserDrawerVisible,
    isConfirmDialogOpen,
    isResetPasswordDialogOpen,
    detailData,
    fetchUsers,
    addData,
    selectData,
    submitProcess,
    updateDeleteData,
    deleteData,
    openResetPasswordDialog,
    resetPassword,
  }
}
