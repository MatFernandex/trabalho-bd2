import { create } from 'zustand'

export type User = Partial<{
  usu_codigo: number
  usu_nome: string
  usu_senha: string
  usu_role: string
  fun_codigo: number
  fun_nome: string
  fun_cpf: string
  fun_senha: string
  fun_funcao: string
}>

interface UserState {
  user: User | null
}

interface UserActions {
  cleanUp: () => void
}

export const useUserStore = create<UserState & UserActions>((set, get) => ({
  user: null,

  cleanUp: () => {
    set({
      user: null,
    })
  },
}))
