import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const isSessionExpiredModalOpen = ref(false)

  const triggerSessionExpired = () => {
    isSessionExpiredModalOpen.value = true
  }

  const handleLogoutConfirm = () => {
    isSessionExpiredModalOpen.value = false

    // Clear session cookies
    useCookie('accessToken').value = null
    useCookie('userData').value = null
    useCookie('userAbilityRules').value = null

    const currentPath = window.location.pathname
    if (currentPath !== '/login') {
      window.location.href = `/login?to=${encodeURIComponent(currentPath)}`
    }
  }

  return {
    isSessionExpiredModalOpen,
    triggerSessionExpired,
    handleLogoutConfirm,
  }
})
