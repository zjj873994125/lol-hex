export type { PageResult } from './common'

export interface Hero {
  id: number
  name: string
  title: string
  nickname?: string
  avatar: string
  tags: string[]
  description: string
  status: number
  equipments?: HeroEquipment[]
  hexes?: HeroHex[]
  equipmentBuilds?: EquipmentBuild[]
  createdAt: string
  updatedAt: string
}

// 出装思路
export interface EquipmentBuild {
  id: number
  heroId: number
  name: string
  description?: string
  priority: number
  status: number
  equipments?: BuildEquipment[]
  createdAt: string
  updatedAt: string
}

// 出装思路中的装备
export interface BuildEquipment {
  id: number
  buildId: number
  equipmentId: number
  priority: number
  description?: string
  equipment?: Equipment
  createdAt: string
  updatedAt: string
}

// 兼容旧版本，保留 HeroEquipment
export interface HeroEquipment {
  id: number
  heroId: number
  equipmentId: number
  buildId?: number
  priority: number
  description?: string
  equipment?: Equipment
  createdAt: string
  updatedAt: string
}

export interface HeroHex {
  id: number
  heroId: number
  hexId: number
  priority: number
  description?: string
  hex?: Hex
  createdAt: string
  updatedAt: string
}

export interface HeroParams {
  keyword?: string
  tags?: string[]
  status?: number
  page?: number
  pageSize?: number
}

export interface HeroFormData {
  name: string
  title: string
  nickname?: string
  avatar: string
  tags: string[]
  description: string
  status: number
  equipmentIds?: number[]
  hexIds?: number[]
}

// 用于装备和海克斯的简要信息
export interface Equipment {
  id: number
  name: string
  icon: string
  price: number
  keywords?: string
  description: string
  status: number
}

export interface Hex {
  id: number
  name: string
  icon: string
  tier: number
  description: string
  status: number
}

// 英雄定位
export const HeroPositionOptions = [
  { label: '坦克', value: 'tank' },
  { label: '战士', value: 'fighter' },
  { label: '刺客', value: 'assassin' },
  { label: '法师', value: 'mage' },
  { label: '射手', value: 'marksman' },
  { label: '辅助', value: 'support' },
]
