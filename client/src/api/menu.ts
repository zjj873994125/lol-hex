import api from './index'
import type { Menu, MenuParams, MenuFormData, MenuTree } from '@/types/menu'

const BASE_URL = '/menus'

export const menuApi = {
  // 获取菜单列表
  getList: (params?: MenuParams) => {
    return api.get<Menu[]>(BASE_URL, params)
  },

  // 获取菜单树
  getTree: () => {
    return api.get<MenuTree[]>(`${BASE_URL}/tree`)
  },

  // 获取菜单详情
  getDetail: (id: number) => {
    return api.get<Menu>(`${BASE_URL}/${id}`)
  },

  // 创建菜单
  create: (data: MenuFormData) => {
    return api.post<Menu>(BASE_URL, data)
  },

  // 更新菜单
  update: (id: number, data: MenuFormData) => {
    return api.put<Menu>(`${BASE_URL}/${id}`, data)
  },

  // 删除菜单
  delete: (id: number) => {
    return api.delete(`${BASE_URL}/${id}`)
  },
}
