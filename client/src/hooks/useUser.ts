import api from '@/services/api-client'
import { useAuthStore } from '@/stores/useAuthStore'
import { type User, useUserStore } from '@/stores/useUserStore'
import { useCallback, useEffect, useState } from 'react'

export const useUser = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<unknown | null>(null)
  const [attemptedFetch, setAttemptedFetch] = useState(false)

  const { access_token: token } = useAuthStore.getState()

  const user = useUserStore((state) => state.user)

  const getUser = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await api.get<User>('/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      console.log(data)
      useUserStore.setState({ user: data })

      setIsLoading(false)
      return data
    } catch (error) {
      setError(error)
      setIsLoading(false)

      throw error
    } finally {
      setAttemptedFetch(true)
    }
  }, [token])

  useEffect(() => {
    if (user == null && !attemptedFetch) {
      getUser().catch(console.error)
    }
  }, [user, getUser, attemptedFetch])

  return { isLoading, error, getUser, user }
}
