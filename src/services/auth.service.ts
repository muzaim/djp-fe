import type { LoginCredentials, LoginResponseData } from './types/auth.types'

export class AuthService {
  /**
   * Execute login via POST /auth/login
   */
  static async login(credentials: LoginCredentials): Promise<LoginResponseData> {
    const res = await $api('/auth/login', {
      method: 'POST',
      body: {
        email: credentials.email,
        password: credentials.password,
      },
    })

    return res?.data || res
  }

  /**
   * Mock / fallback login method
   */
  static async loginV2(credentials?: LoginCredentials): Promise<LoginResponseData> {
    if (credentials && credentials.email) {
      return this.login(credentials)
    }

    const res = await $api('/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@smf.co.id',
        password: '123',
      },
    })

    return res?.data || res
  }

  /**
   * Change logged in user password via POST /auth/change-password
   */
  static async changePassword(payload: { newPassword: string; confirmPassword: string }): Promise<any> {
    const res = await $api('/auth/change-password', {
      method: 'POST',
      body: {
        newPassword: payload.newPassword,
        confirmPassword: payload.confirmPassword,
        retypePassword: payload.confirmPassword,
      },
    })

    return res?.data || res
  }
}
