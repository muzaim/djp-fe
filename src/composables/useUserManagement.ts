import { refDebounced } from '@vueuse/core'
import { UserService } from '@/services/user.service'
import type { CreateUserPayload, UpdateUserPayload, UserItem } from '@/services/types/user.types'

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
   * Fetch paginated users via UserService
   */
  const fetchUsers = async () => {
    isLoading.value = true
    try {
      const res = await UserService.getUsers({
        page: page.value,
        limit: itemsPerPage.value,
        search: debouncedSearch.value,
      })

      users.value = res.data.map((item, index) => ({
        ...item,
        index: (page.value - 1) * itemsPerPage.value + index + 1,
      }))

      totalUsers.value = res.total
    }
    catch (err: any) {
      console.error('Fetch users error:', err)
      snackBarText.value = err?.message || 'Failed to fetch users'
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
      phoneNumber: '',
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
   * Save user (Create or Update) sending roleIds array directly in DTO
   */
  const submitProcess = async (formData: any) => {
    isLoading.value = true
    try {
      const selectedRoleId = formData.roleId || formData.id_roles

      if (formData.id) {
        const updatePayload: UpdateUserPayload = {
          id: String(formData.id),
          name: formData.name || formData.full_name,
          email: formData.email,
        }

        if (formData.phoneNumber || formData.phone) {
          updatePayload.phoneNumber = formData.phoneNumber || formData.phone
        }
        if (formData.positionId || formData.id_msso) {
          updatePayload.positionId = formData.positionId || formData.id_msso
        }
        if (selectedRoleId) {
          updatePayload.roleIds = [String(selectedRoleId)]
        }

        await UserService.updateUser(updatePayload)
        snackBarText.value = 'Success, Update user data!'
      }
      else {
        const createPayload: CreateUserPayload = {
          name: formData.name || formData.full_name,
          email: formData.email,
        }

        if (formData.phoneNumber || formData.phone) {
          createPayload.phoneNumber = formData.phoneNumber || formData.phone
        }
        if (formData.positionId || formData.id_msso) {
          createPayload.positionId = formData.positionId || formData.id_msso
        }
        if (selectedRoleId) {
          createPayload.roleIds = [String(selectedRoleId)]
        }

        await UserService.createUser(createPayload)
        snackBarText.value = 'Success, Add new user!'
      }

      snackBarColour.value = 'primary'
      isSnackbarVisible.value = true
      isAddNewUserDrawerVisible.value = false
      await fetchUsers()
    }
    catch (err: any) {
      console.error('Submit user error:', err)
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
   * Delete user upon confirmation
   */
  const deleteData = async (confirm: boolean) => {
    if (confirm && idDelete.value) {
      isLoading.value = true
      try {
        await UserService.deleteUser(idDelete.value)
        snackBarText.value = 'User deleted successfully!'
        snackBarColour.value = 'primary'
        isSnackbarVisible.value = true
        await fetchUsers()
      }
      catch (err: any) {
        console.error('Delete user error:', err)
        snackBarText.value = err?.message || 'Failed to delete user'
        snackBarColour.value = 'error'
        isSnackbarVisible.value = true
      }
      finally {
        isLoading.value = false
      }
    }
    idDelete.value = ''
  }

  /**
   * Open reset password confirmation dialog
   */
  const openResetPasswordDialog = (id: string) => {
    idResetPassword.value = id
    isResetPasswordDialogOpen.value = true
  }

  /**
   * Reset user password to default 12345 upon confirmation
   */
  const resetPassword = async (confirm: boolean) => {
    if (confirm && idResetPassword.value) {
      isLoading.value = true
      try {
        await UserService.resetPassword(idResetPassword.value)
        snackBarText.value = 'Password reset to default (12345) successfully!'
        snackBarColour.value = 'primary'
        isSnackbarVisible.value = true
      }
      catch (err: any) {
        console.error('Reset password error:', err)
        const msg = err?.data?.message || err?.message || 'Failed to reset password'
        snackBarText.value = Array.isArray(msg) ? msg.join(', ') : msg
        snackBarColour.value = 'error'
        isSnackbarVisible.value = true
      }
      finally {
        isLoading.value = false
      }
    }
    idResetPassword.value = ''
  }

  // Reset to page 1 on search change
  watch(searchQuery, () => {
    page.value = 1
  })

  watch([page, itemsPerPage, debouncedSearch], () => {
    fetchUsers()
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
