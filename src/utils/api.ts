import { ofetch } from 'ofetch'
import { useAuthStore } from '@/stores/useAuthStore'

export const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  async onRequest({ options }) {
    const accessToken = useCookie('accessToken').value

    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    }

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`
    }

    options.headers = headers
  },

  async onResponseError({ response }) {
    // 401 Unauthorized -> Token expired or invalid session
    if (response?.status === 401) {
      console.warn('Session expired or unauthorized (401). Opening Session Expired modal...')

      const authStore = useAuthStore()
      authStore.triggerSessionExpired()
    }
  },
})
