export interface UserParams {
  q: string
  role: string
  plan: string
  status: string
  options: object
}

export interface UserProperties {
  id?: number
  username?: string
  full_name?: string
  email?: string
  password?: string
  divisi?: string
  confirm_password?: string
  support_group_id?: string
  phone?: string
  id_msso?: string
  id_roles?: string
  image_1?: string
  status?: string
}
