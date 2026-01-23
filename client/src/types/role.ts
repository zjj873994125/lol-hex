import { Menu } from './menu'

export type { PageResult } from './common'

export interface Role {
  id: number
  name: string
  code: string
  description?: string
  menus?: Menu[]
  createdAt: string
  updatedAt: string
}

export interface RoleParams {
  name?: string
  code?: string
  page?: number
  pageSize?: number
}

export interface RoleFormData {
  name: string
  code: string
  description?: string
  menuIds?: number[]
}
