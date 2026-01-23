import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { UserInfo } from '@/types/user'
import { setToken, setUser as saveUser, removeToken, removeUser } from '@/utils/auth'

interface UserState {
  user: UserInfo | null
  token: string | null
  isAuthenticated: boolean
  setUser: (user: UserInfo) => void
  setToken: (token: string) => void
  login: (user: UserInfo, token: string) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isAuthenticated: false,
        setUser: (user) => set({ user }),
        setToken: (token) => set({ token, isAuthenticated: !!token }),
        login: (user, token) => {
          setToken(token)
          saveUser(user)
          set({ user, token, isAuthenticated: true })
        },
        logout: () => {
          removeToken()
          removeUser()
          set({ user: null, token: null, isAuthenticated: false })
        },
      }),
      {
        name: 'user-storage',
      }
    )
  )
)
