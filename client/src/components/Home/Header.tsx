'use client'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { useUser } from '@/hooks/useUser'
import { useCallback } from 'react'

const Header = () => {
  const { logout } = useAuth()
  const { user } = useUser()

  const handleLogout = useCallback(() => {
    logout()
    window.location.href = '/auth/login'
  }, [logout])

  return (
    <div className="flex items-center justify-between p-8">
      <div className="flex flex-row gap-x-2 items-center">
        <h1 className="font-heading text-lg">Olá,</h1>
        {user && <p className="text-lg text-muted-foreground">{user.usu_nome ?? user.fun_nome}</p>}
      </div>
      <Button color="white" variant="outline" onClick={handleLogout}>
        Sair
      </Button>
    </div>
  )
}

export { Header }
