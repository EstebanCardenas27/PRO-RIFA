import { useAuth } from '../../hooks/useAuth'
import { Dashboard } from './Dashboard'
import { Login } from './Login'

export const Admin = () => {
  const { isAuthenticated, isAuthLoading, login, logout } = useAuth()

  if (isAuthLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">
        <p className="text-sm text-white/60">Cargando sesión...</p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Login onLogin={login} />
  }

  return <Dashboard onLogout={logout} />
}