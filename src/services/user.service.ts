import type { CreateUserPayload, UpdateUserPayload, UserItem, UserQueryParams } from './types/user.types'

export class UserService {
  /**
   * Fetch paginated list of users matching NestJS response
   */
  static async getUsers(params?: UserQueryParams): Promise<{ data: UserItem[]; total: number }> {
    const res = await $api('/users', {
      method: 'GET',
      params: {
        page: params?.page || 1,
        limit: params?.limit || 10,
        search: params?.search || '',
      },
    })

    const payload = res?.data || res
    let items: UserItem[] = []
    let total = 0

    if (payload?.items && Array.isArray(payload.items)) {
      items = payload.items
      total = payload?.meta?.totalItems || payload?.meta?.total || items.length
    }
    else if (Array.isArray(payload)) {
      items = payload
      total = items.length
    }
    else if (payload?.data && Array.isArray(payload.data)) {
      items = payload.data
      total = payload?.totalItems || payload?.total || items.length
    }

    return {
      data: items,
      total,
    }
  }

  /**
   * Get single user details by ID
   */
  static async getUserById(id: string): Promise<UserItem> {
    const res = await $api(`/users/${id}`, {
      method: 'GET',
    })

    return res?.data || res
  }

  /**
   * Create new user matching CreateUserDto (Default password handled by backend)
   */
  static async createUser(payload: CreateUserPayload): Promise<UserItem> {
    const res = await $api('/users', {
      method: 'POST',
      body: payload,
    })

    return res?.data || res
  }

  /**
   * Update existing user matching UpdateUserDto
   */
  static async updateUser(payload: UpdateUserPayload): Promise<UserItem> {
    const { id, ...body } = payload

    const res = await $api(`/users/${id}`, {
      method: 'PATCH',
      body,
    })

    return res?.data || res
  }

  /**
   * Reset user password back to default 12345
   */
  static async resetPassword(id: string): Promise<void> {
    await $api(`/users/${id}/reset-password`, {
      method: 'POST',
    })
  }

  /**
   * Soft delete user by ID
   */
  static async deleteUser(id: string): Promise<void> {
    await $api(`/users/${id}`, {
      method: 'DELETE',
    })
  }
}
