import api from './index'
import type { Hero, HeroParams, HeroFormData, PageResult } from '@/types/hero'
import type { ApiResponse } from '@/types/common'

const BASE_URL = '/heroes'

export const heroApi = {
  // 获取英雄列表
  getList: (params: HeroParams) => {
    return api.get<PageResult<Hero>>(`${BASE_URL}/list`, params)
  },

  // 获取英雄详情
  getDetail: (id: number) => {
    return api.get<Hero>(`${BASE_URL}/${id}`)
  },

  // 创建英雄
  create: (data: HeroFormData) => {
    return api.post<Hero>(BASE_URL, data)
  },

  // 更新英雄
  update: (id: number, data: HeroFormData) => {
    return api.put<Hero>(`${BASE_URL}/${id}`, data)
  },

  // 删除英雄
  delete: (id: number) => {
    return api.delete(`${BASE_URL}/${id}`)
  },

  // 获取热门英雄
  getHotHeroes: (limit = 6) => {
    return api.get<Hero[]>(`${BASE_URL}/hot`, { limit })
  },

  // 根据标签搜索英雄
  searchByTags: (tags: string[]) => {
    return api.get<Hero[]>(`${BASE_URL}/search/tags`, { tags })
  },

  // 更新英雄推荐装备
  updateEquipments: (id: number, equipments: { equipmentId: number; priority?: number; description?: string }[]) => {
    return api.put(`${BASE_URL}/${id}/equipments`, { equipments })
  },

  // 更新英雄推荐海克斯
  updateHexes: (id: number, hexes: { hexId: number; priority?: number; description?: string }[]) => {
    return api.put(`${BASE_URL}/${id}/hexes`, { hexes })
  },
}
