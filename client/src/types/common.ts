// 通用类型定义

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

export interface PageResult<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

export interface PageParams {
  page?: number
  pageSize?: number
}

export enum Status {
  DISABLED = 0,
  ENABLED = 1,
}

export enum EquipmentType {
  WEAPON = 1,
  ARMOR = 2,
  ACCESSORY = 3,
  CONSUMABLE = 4,
}

export enum HexTier {
  BRONZE = 1,
  SILVER = 2,
  GOLD = 3,
}

export enum MenuType {
  DIRECTORY = 1,
  MENU = 2,
  BUTTON = 3,
}
