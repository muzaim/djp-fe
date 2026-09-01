/* eslint-disable unused-imports/no-unused-vars */
import { ofetch } from 'ofetch'

const router = useRouter()
const userData = useCookie<any>('userData')

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
  async onResponse({ request, response }) {
    // Optional global response logger
  },
})
