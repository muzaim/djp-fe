import { createFetch } from '@vueuse/core'
import { destr } from 'destr'

const router = useRouter()

// const ability = useAbility()

// TODO: Get type from backend
const userData = useCookie<any>('userData')

export const useApi = createFetch({
  baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
  fetchOptions: {
    headers: {
      Accept: 'application/json',
    },
  },

  options: {
    refetch: true,
    async beforeFetch({ options }) {
      const accessToken = useCookie('accessToken').value

      if (accessToken) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${accessToken}`,

        }
      }

      return { options }
    },
    afterFetch(ctx) {
      const { data, response } = ctx

      // Parse data if it's JSON

      let parsedData = null
      try {
        parsedData = destr(data)
      }
      catch (error) {
        console.error(error)
      }

      return { data: parsedData, response }
    },
    updateDataOnError: true,
    async onFetchError(ctx) {
      // ctx.data can be null when 5xx response

      const res = JSON.parse(ctx.data)

      // if (res.statusCode === 401) {
      //   // Remove "accessToken" from cookie
      //   useCookie('accessToken').value = null

      //   // Remove "userData" from cookie
      //   userData.value = null

      //   // ℹ️ We had to remove abilities in then block because if we don't nav menu items mutation is visible while redirecting user to login page
      //   // Remove "userAbilities" from cookie
      //   // useCookie('userAbilityRules').value = null

      //   // Reset ability to initial ability
      //   // ability.update([])

      //   // Redirect to login page
      //   await router.push('/login')
      // }

      return ctx
    },
  },
})
