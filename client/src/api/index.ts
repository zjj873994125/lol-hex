import request from '@/utils/request'
import type { ApiResponse } from '@/types/common'

export default {
  get: <T = any>(url: string, params?: any) => {
    return request.get<ApiResponse<T>>(url, { params }).then(res => res.data)
  },
  post: <T = any>(url: string, data?: any) => {
    return request.post<ApiResponse<T>>(url, data).then(res => res.data)
  },
  put: <T = any>(url: string, data?: any) => {
    return request.put<ApiResponse<T>>(url, data).then(res => res.data)
  },
  delete: <T = any>(url: string) => {
    return request.delete<ApiResponse<T>>(url).then(res => res.data)
  },
}
