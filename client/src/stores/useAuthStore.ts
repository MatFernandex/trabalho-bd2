import { stateStorage } from '@/utils/stateStorage'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useUserStore } from './useUserStore'

interface AuthState {
  access_token: string | null
}

interface AuthActions {
  cleanUp: () => void
}

export const useAuthStore = create(
  persist<AuthState & AuthActions>(
    (set, get) => ({
      access_token: null,

      cleanUp: () => {
        useUserStore.getState().cleanUp()

        set({
          access_token: null,
        })
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(stateStorage),
    },
  ),
)
