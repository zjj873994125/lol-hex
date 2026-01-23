import api from './index'
import type { Hex, HexParams, HexFormData, PageResult } from '@/types/hex'

const BASE_URL = '/hexes'

export const hexApi = {
  // 获取海克斯列表
  getList: (params: HexParams) => {
    return api.get<PageResult<Hex>>(BASE_URL, params)
  },

  // 获取海克斯详情
  getDetail: (id: number) => {
    return api.get<Hex>(`${BASE_URL}/${id}`)
  },

  // 创建海克斯
  create: (data: HexFormData) => {
    return api.post<Hex>(BASE_URL, data)
  },

  // 更新海克斯
  update: (id: number, data: HexFormData) => {
    return api.put<Hex>(`${BASE_URL}/${id}`, data)
  },

  // 删除海克斯
  delete: (id: number) => {
    return api.delete(`${BASE_URL}/${id}`)
  },
}
