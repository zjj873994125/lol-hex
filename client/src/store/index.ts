import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AppState {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        collapsed: false,
        setCollapsed: (collapsed) => set({ collapsed }),
      }),
      {
        name: 'app-storage',
      }
    )
  )
)
