import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'
import { getToken, clearAuth } from './auth'
import type { ApiResponse } from '@/types/common'

// 防止重复弹窗
let isShowing401 = false

// 创建 axios 实例
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response

    // 成功响应：code 为 200 或 0
    if (data.code === 200 || data.code === 0) {
      return response
    }

    // 业务错误：从响应体中获取错误消息
    const errorMsg = data.message || '请求失败'
    message.error(errorMsg)

    return Promise.reject(new Error(errorMsg))
  },
  (error: AxiosError<ApiResponse>) => {
    // HTTP 错误
    if (error.response) {
      const { status, data } = error.response

      // 从响应体中提取错误消息
      const errorMsg = data?.message || getHttpErrorMessage(status)

      switch (status) {
        case 401:
          if (!isShowing401) {
            isShowing401 = true
            message.error(errorMsg)
            clearAuth()
            window.location.href = '/login'
            setTimeout(() => { isShowing401 = false }, 1000)
          }
          break
        case 403:
          message.error(errorMsg)
          break
        case 404:
          message.error(errorMsg)
          break
        case 500:
          message.error(errorMsg)
          break
        default:
          message.error(errorMsg)
      }

      return Promise.reject(error)
    }

    // 网络错误
    if (error.request) {
      message.error('网络错误，请检查网络连接')
      return Promise.reject(error)
    }

    // 请求配置错误
    message.error(error.message || '请求配置错误')
    return Promise.reject(error)
  }
)

// HTTP 状态码对应的默认消息
function getHttpErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: '请求参数错误',
    401: '未授权，请重新登录',
    403: '无权限访问',
    404: '请求的资源不存在',
    405: '请求方法不允许',
    408: '请求超时',
    500: '服务器内部错误',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时',
  }
  return messages[status] || `请求失败 (${status})`
}

export default instance
