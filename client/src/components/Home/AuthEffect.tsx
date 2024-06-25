'use client'
import { useAuthStore } from '@/stores/useAuthStore'

const AuthEffect = () => {
  const { access_token: token } = useAuthStore.getState()

  if (typeof window !== 'undefined' && !token) {
    window.location.href = '/auth/login'
  }

  return false
}

export { AuthEffect }
