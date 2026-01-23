import api from './index'
import type { Equipment, EquipmentParams, EquipmentFormData, PageResult } from '@/types/equipment'

const BASE_URL = '/equipments'

export const equipmentApi = {
  // 获取装备列表
  getList: (params: EquipmentParams) => {
    return api.get<PageResult<Equipment>>(BASE_URL, params)
  },

  // 获取装备详情
  getDetail: (id: number) => {
    return api.get<Equipment>(`${BASE_URL}/${id}`)
  },

  // 创建装备
  create: (data: EquipmentFormData) => {
    return api.post<Equipment>(BASE_URL, data)
  },

  // 更新装备
  update: (id: number, data: EquipmentFormData) => {
    return api.put<Equipment>(`${BASE_URL}/${id}`, data)
  },

  // 删除装备
  delete: (id: number) => {
    return api.delete(`${BASE_URL}/${id}`)
  },
}
