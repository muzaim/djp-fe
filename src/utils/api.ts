/* eslint-disable unused-imports/no-unused-vars */
import { ofetch } from 'ofetch'

const router = useRouter()
const userData = useCookie<any>('userData')
export const $api = ofetch.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  async onRequest({ options }) {
    const accessToken = useCookie('accessToken').value
    if (accessToken) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
      }
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async onResponse({ request, response }) {
    // Log response
    // console.log('[fetch response]', request, response.status, response.body)
    // if (response.status === 401) {
    //   // Remove "accessToken" from cookie
    //   useCookie('accessToken').value = null

    //   // Remove "userData" from cookie
    //   userData.value = null

    //   // Redirect to login page
    //   await router.push('/login')
    // }
  },
})
