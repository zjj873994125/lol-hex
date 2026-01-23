export type { PageResult } from './common'

export interface Hex {
  id: number
  name: string
  icon: string
  tier: 1 | 2 | 3
  description: string
  status: number
  createdAt: string
  updatedAt: string
}

export interface HexParams {
  keyword?: string
  tier?: number
  status?: number
  page?: number
  pageSize?: number
}

export interface HexFormData {
  name: string
  icon: string
  tier: 1 | 2 | 3
  description: string
  status: number
}

export const HexTierMap: Record<number, string> = {
  1: '棱彩',
  2: '白银',
  3: '黄金',
}

export const HexTierOptions = [
  { label: '棱彩', value: 1 },
  { label: '白银', value: 2 },
  { label: '黄金', value: 3 },
]

export const HexTierColorMap: Record<number, string> = {
  1: '#0ac8b9',
  2: '#c0c0c0',
  3: '#ffd700',
}
