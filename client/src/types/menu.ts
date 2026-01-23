export interface Menu {
  id: number
  parentId?: number
  name: string
  path: string
  icon?: string
  type: 1 | 2 | 3
  sort: number
  status: number
  children?: Menu[]
  createdAt: string
  updatedAt: string
}

export interface MenuParams {
  name?: string
  type?: number
  status?: number
}

export interface MenuFormData {
  parentId?: number
  name: string
  path: string
  icon?: string
  type: 1 | 2 | 3
  sort: number
  status: number
}

export interface MenuTree extends Menu {
  children?: MenuTree[]
}

export const MenuTypeMap: Record<number, string> = {
  1: '目录',
  2: '菜单',
  3: '按钮',
}

export const MenuTypeOptions = [
  { label: '目录', value: 1 },
  { label: '菜单', value: 2 },
  { label: '按钮', value: 3 },
]
