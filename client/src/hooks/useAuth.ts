import api from '@/services/api-client'
import { useAuthStore } from '@/stores/useAuthStore'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface AuthParams {
  username: string
  password: string
  role: 'USUARIO' | 'VENDEDOR'
}

type LoginParams = AuthParams

type RegisterParams = AuthParams & {
  cpf?: string
  funcao?: string
}

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<unknown | null>(null)

  const login = async (params: LoginParams) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/login', params)

      console.log(data)
      toast('Login realizado com sucesso!', { type: 'success' })

      useAuthStore.setState({ access_token: data.access_token })
      setIsLoading(false)
      return data
    } catch (error) {
      setError(error)
      setIsLoading(false)

      toast('Erro ao realizar login. Por favor, tente novamente.', { type: 'error' })
      throw error
    }
  }

  const logout = () => {
    toast('Logout realizado com sucesso!', { type: 'success' })
    useAuthStore.getState().cleanUp()
  }

  const register = async (params: RegisterParams) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/register', params)

      console.log(data)
      toast('Registro realizado com sucesso!', { type: 'success' })

      useAuthStore.setState({ access_token: data.access_token })
      setIsLoading(false)
      return data
    } catch (error) {
      setError(error)
      setIsLoading(false)

      toast('Erro ao realizar registro. Por favor, tente novamente.', { type: 'error' })
      throw error
    }
  }

  return { isLoading, error, login, logout, register }
}
