import api from './index'
import type { User, UserParams, UserFormData, PageResult } from '@/types/user'

const BASE_URL = '/users'

export const userApi = {
  // 获取用户列表
  getList: (params: UserParams) => {
    return api.get<PageResult<User>>(BASE_URL, params)
  },

  // 获取用户详情
  getDetail: (id: number) => {
    return api.get<User>(`${BASE_URL}/${id}`)
  },

  // 创建用户
  create: (data: UserFormData) => {
    return api.post<User>(BASE_URL, data)
  },

  // 更新用户
  update: (id: number, data: UserFormData) => {
    return api.put<User>(`${BASE_URL}/${id}`, data)
  },

  // 删除用户
  delete: (id: number) => {
    return api.delete(`${BASE_URL}/${id}`)
  },

  // 更新用户状态
  updateStatus: (id: number, status: number) => {
    return api.put(`${BASE_URL}/${id}/status`, { status })
  },

  // 重置密码
  resetPassword: (id: number, password: string) => {
    return api.put(`${BASE_URL}/${id}/resetPassword`, { password })
  },
}
