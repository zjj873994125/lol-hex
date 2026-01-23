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
  recommendedEquipments?: HeroEquipment[]
  recommendedHexes?: HeroHex[]
  createdAt: string
  updatedAt: string
}

export interface HeroEquipment {
  id: number
  heroId: number
  equipmentId: number
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
