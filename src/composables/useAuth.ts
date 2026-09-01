import type { VForm } from 'vuetify/components/VForm'
import { AuthService } from '@/services/auth.service'
import type { LoginCredentials } from '@/services/types/auth.types'

export function useAuth() {
  const route = useRoute()
  const router = useRouter()
  const ability = useAbility()

  const isPasswordVisible = ref(false)
  const isSnackbarVisible = ref(false)
  const snackBarText = ref('')
  const snackBarColour = ref('')
  const isLoading = ref(false)

  const errors = ref<Record<string, string | undefined>>({
    email: undefined,
    password: undefined,
  })

  const refVForm = ref<VForm>()

  const credentials = ref<LoginCredentials>({
    email: '',
    password: '',
  })

  const saveSession = (accessToken: string, userData: any, userAbilityRules?: any[]) => {
    const defaultRules = userAbilityRules || [
      {
        action: 'manage',
        subject: 'all',
      },
    ]

    const parsedUserData = typeof userData === 'string' ? JSON.parse(userData) : (userData || {})

    const formattedUserData = {
      ...parsedUserData,
      roles_id: parsedUserData?.roles_id || '1',
      role: parsedUserData?.role || (Array.isArray(parsedUserData?.roles) ? parsedUserData.roles[0] : 'admin'),
    }

    useCookie('userAbilityRules').value = defaultRules
    useCookie('userData').value = formattedUserData
    useCookie('accessToken').value = accessToken

    ability.update(defaultRules)
  }

  /**
   * Execute login via AuthService and handle session & navigation
   */
  const handleLogin = async (useMock = false) => {
    isLoading.value = true
    try {
      const res = useMock ? await AuthService.loginV2() : await AuthService.login(credentials.value)

      saveSession(res.accessToken, res.user)

      await nextTick(() => {
        router.replace(route.query.to ? String(route.query.to) : '/')
      })
    }
    catch (err: any) {
      console.error('Login error:', err)

      const errorMsg = err?.data?.message || err?.message || 'Failed, Please check your email and password'

      snackBarText.value = Array.isArray(errorMsg) ? errorMsg.join(', ') : errorMsg
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Handle form submission after validation
   */
  const onSubmit = (useMock = false) => {
    refVForm.value?.validate().then(({ valid: isValid }) => {
      if (isValid)
        handleLogin(useMock)
    })
  }

  return {
    credentials,
    isPasswordVisible,
    isSnackbarVisible,
    snackBarText,
    snackBarColour,
    isLoading,
    errors,
    refVForm,
    handleLogin,
    onSubmit,
  }
}
