import type { RouteRecordRaw } from 'vue-router/auto'

// 👉 Redirects
export const redirects: RouteRecordRaw[] = [
  // ℹ️ We are redirecting to different pages based on role.
  // NOTE: Role is just for UI purposes. ACL is based on abilities.
  {
    path: '/',
    name: 'index',
    redirect: to => {
      // TODO: Get type from backend
      const userData = useCookie<Record<string, unknown> | null | undefined>('userData')
      const userRole = userData.value?.roles_id

      if (userRole === '1' || userRole === '2')
        return { name: 'root' }
      if (userRole === '3' || userRole === '4' || userRole === '5' || userRole === '6' || userRole === '7' || userRole === '8' || userRole === '9' || userRole === '10')
        return { name: 'dashboards-incident' }

      return { name: 'login', query: to.query }
    },
  },
  {
    path: '/profile/account-settings',
    name: 'profile-account-settings',
    redirect: () => ({ name: 'profile-account-settings-tab', params: { tab: 'account' } }),
  },
]

export const routes: RouteRecordRaw[] = [
  // Email filter

]
