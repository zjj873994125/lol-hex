import { Role } from './role'

export type { PageResult } from './common'

export interface User {
  id: number
  username: string
  phone: string
  email?: string
  avatar?: string
  status: number
  roles?: Role[]
  createdAt: string
  updatedAt: string
}

export interface UserParams {
  username?: string
  phone?: string
  email?: string
  status?: number
  page?: number
  pageSize?: number
}

export interface UserFormData {
  username: string
  phone: string
  password?: string
  email?: string
  status: number
  roleId?: number
}

export interface LoginParams {
  phone: string
  password: string
}

export interface RegisterParams {
  username: string
  phone: string
  password: string
  email?: string
}

export interface LoginResult {
  token: string
  user: UserInfo
}

export interface UserInfo {
  id: number
  username: string
  phone: string
  email?: string
  avatar?: string
  status: number
  role?: RoleInfo
  permissions?: string[]
}

export interface RoleInfo {
  id: number
  name: string
  code: string
}

export interface UpdateProfileParams {
  username?: string
  email?: string
  avatar?: string
}

export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
}
