import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Menu } from '@/types/menu'

interface MenuState {
  menus: Menu[]
  openKeys: string[]
  selectedKeys: string[]
  setMenus: (menus: Menu[]) => void
  setOpenKeys: (keys: string[]) => void
  setSelectedKeys: (keys: string[]) => void
  clearMenuState: () => void
}

export const useMenuStore = create<MenuState>()(
  devtools(
    (set) => ({
      menus: [],
      openKeys: [],
      selectedKeys: [],
      setMenus: (menus) => set({ menus }),
      setOpenKeys: (keys) => set({ openKeys: keys }),
      setSelectedKeys: (keys) => set({ selectedKeys: keys }),
      clearMenuState: () => set({ openKeys: [], selectedKeys: [] }),
    }),
    {
      name: 'menu-storage',
    }
  )
)
