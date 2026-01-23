import api from './index'
import type { Role, RoleParams, RoleFormData, PageResult } from '@/types/role'

const BASE_URL = '/roles'

export const roleApi = {
  // 获取角色列表
  getList: (params: RoleParams) => {
    return api.get<PageResult<Role>>(BASE_URL, params)
  },

  // 获取所有角色（不分页）
  getAll: () => {
    return api.get<Role[]>(`${BASE_URL}/all`)
  },

  // 获取角色详情
  getDetail: (id: number) => {
    return api.get<Role>(`${BASE_URL}/${id}`)
  },

  // 获取角色菜单
  getMenus: (id: number) => {
    return api.get<number[]>(`${BASE_URL}/${id}/menus`)
  },

  // 创建角色
  create: (data: RoleFormData) => {
    return api.post<Role>(BASE_URL, data)
  },

  // 更新角色
  update: (id: number, data: RoleFormData) => {
    return api.put<Role>(`${BASE_URL}/${id}`, data)
  },

  // 更新角色菜单
  updateMenus: (id: number, menuIds: number[]) => {
    return api.put(`${BASE_URL}/${id}/menus`, { menuIds })
  },

  // 删除角色
  delete: (id: number) => {
    return api.delete(`${BASE_URL}/${id}`)
  },
}
