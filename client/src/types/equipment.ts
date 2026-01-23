export type { PageResult } from './common'

export interface Equipment {
  id: number
  name: string
  icon: string
  price: number
  keywords: string
  description: string
  status: number
  createdAt: string
  updatedAt: string
}

export interface EquipmentParams {
  keyword?: string
  status?: number
  page?: number
  pageSize?: number
}

export interface EquipmentFormData {
  name: string
  icon: string
  price: number
  keywords: string
  description: string
  status: number
}
