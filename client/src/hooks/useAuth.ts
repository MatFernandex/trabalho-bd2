import api from '@/services/api-client'
import { useState } from 'react'

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

      setIsLoading(false)
      return data
    } catch (error) {
      setError(error)
      setIsLoading(false)
      throw error
    }
  }

  const register = async (params: RegisterParams) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/auth/register', params)

      console.log(data)

      setIsLoading(false)
      return data
    } catch (error) {
      setError(error)
      setIsLoading(false)
      throw error
    }
  }

  return { isLoading, error, login, register }
}
