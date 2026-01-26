import api from './index'
import type { LoginParams, LoginResult, RegisterParams, UserInfo, UpdateProfileParams, ChangePasswordParams } from '@/types/user'

const BASE_URL = '/auth'

export const authApi = {
  // 登录
  login: (params: LoginParams) => {
    return api.post<LoginResult>(`${BASE_URL}/login`, params)
  },

  // 注册
  register: (params: RegisterParams) => {
    return api.post<LoginResult>(`${BASE_URL}/register`, params)
  },

  // 登出
  logout: () => {
    return api.post(`${BASE_URL}/logout`)
  },

  // 刷新 token
  refreshToken: () => {
    return api.post<{ token: string }>(`${BASE_URL}/refresh`)
  },

  // 获取当前用户信息
  getUserInfo: () => {
    return api.get<UserInfo>(`${BASE_URL}/userInfo`)
  },

  // 更新个人信息
  updateProfile: (params: UpdateProfileParams) => {
    return api.put<UserInfo>(`${BASE_URL}/profile`, params)
  },

  // 修改密码
  changePassword: (params: ChangePasswordParams) => {
    return api.put(`${BASE_URL}/changePassword`, params)
  },
}
