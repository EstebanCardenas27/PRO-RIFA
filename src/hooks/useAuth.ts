import { useCallback, useEffect, useState } from 'react'
import {
  UnauthorizedError,
  getMe,
  login as apiLogin,
  logout as apiLogout,
} from '../services/api'

type AuthState = 'loading' | 'authenticated' | 'anonymous'

export function useAuth() {
  const [state, setState] = useState<AuthState>('loading')

  useEffect(() => {
    let cancelled = false

    getMe()
      .then(() => {
        if (!cancelled) {
          setState('authenticated')
        }
      })
      .catch((err: unknown) => {
        if (!cancelled && err instanceof UnauthorizedError) {
          setState('anonymous')
        }
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    await apiLogin(username, password)
    setState('authenticated')
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiLogout()
    } catch {
      // la cookie puede no existir; ignoramos el error
    }
    setState('anonymous')
  }, [])

  return {
    isAuthenticated: state === 'authenticated',
    isAuthLoading: state === 'loading',
    login,
    logout,
  }
}