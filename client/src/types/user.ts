import { Role } from './role'

export type { PageResult } from './common'

export interface User {
  id: number
  username: string
  email?: string
  status: number
  roles?: Role[]
  createdAt: string
  updatedAt: string
}

export interface UserParams {
  username?: string
  email?: string
  status?: number
  page?: number
  pageSize?: number
}

export interface UserFormData {
  username: string
  password?: string
  email?: string
  status: number
  roleIds?: number[]
}

export interface LoginParams {
  username: string
  password: string
}

export interface RegisterParams {
  username: string
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
  email?: string
  status: number
  roles?: RoleInfo[]
}

export interface RoleInfo {
  id: number
  name: string
  code: string
}
