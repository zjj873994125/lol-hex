import api from './index'
import type { Hero, HeroParams, HeroFormData, PageResult, EquipmentBuild } from '@/types/hero'
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

  // 获取最新英雄
  getHotHeroes: (limit = 6) => {
    return api.get<Hero[]>(`${BASE_URL}/hot`, { limit })
  },

  // 根据标签搜索英雄
  searchByTags: (tags: string[]) => {
    return api.get<Hero[]>(`${BASE_URL}/search/tags`, { tags })
  },

  // ==================== 出装思路相关 ====================

  // 获取英雄的出装思路列表
  getBuilds: (heroId: number) => {
    return api.get<EquipmentBuild[]>(`${BASE_URL}/${heroId}/builds`)
  },

  // 创建出装思路
  createBuild: (heroId: number, data: { name: string; description?: string; priority?: number }) => {
    return api.post<EquipmentBuild>(`${BASE_URL}/${heroId}/builds`, data)
  },

  // 更新出装思路
  updateBuild: (heroId: number, buildId: number, data: { name?: string; description?: string; priority?: number }) => {
    return api.put<EquipmentBuild>(`${BASE_URL}/${heroId}/builds/${buildId}`, data)
  },

  // 删除出装思路
  deleteBuild: (heroId: number, buildId: number) => {
    return api.delete(`${BASE_URL}/${heroId}/builds/${buildId}`)
  },

  // 更新出装思路中的装备
  updateBuildEquipments: (heroId: number, buildId: number, equipments: { equipmentId: number; priority: number; description?: string }[]) => {
    return api.put(`${BASE_URL}/${heroId}/builds/${buildId}/equipments`, { equipments })
  },

  // ==================== 旧版兼容 API ====================

  // 更新英雄推荐装备（已废弃，请使用出装思路相关 API）
  updateEquipments: (id: number, equipments: { equipmentId: number; priority?: number; description?: string }[]) => {
    return api.put(`${BASE_URL}/${id}/equipments`, { equipments })
  },

  // 更新英雄推荐海克斯
  updateHexes: (id: number, hexes: { hexId: number; priority?: number; description?: string }[]) => {
    return api.put(`${BASE_URL}/${id}/hexes`, { hexes })
  },
}
