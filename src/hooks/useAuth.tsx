import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { getAdapter } from '../lib/dataAdapter'
import type { AuthContextValue } from '../types/auth'
import type { UserProfile } from '../types/user'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUser = useCallback(async () => {
    try {
      const current = await getAdapter().getCurrentUser()
      setUser(current)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    void (async () => {
      setLoading(true)
      await refreshUser()
      setLoading(false)
    })()
  }, [refreshUser])

  const register = useCallback(async (fullName: string, email: string, password: string) => {
    setError(null)
    try {
      const profile = await getAdapter().register({ fullName, email, password })
      setUser(profile)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Đăng ký thất bại'
      setError(msg)
      throw e
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      const profile = await getAdapter().login({ email, password })
      setUser(profile)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Đăng nhập thất bại'
      setError(msg)
      throw e
    }
  }, [])

  const logout = useCallback(async () => {
    await getAdapter().logout()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
    if (!user) throw new Error('Chưa đăng nhập')
    const updated = await getAdapter().updateProfile(user.id, data)
    setUser(updated)
  }, [user])

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, error, register, login, logout, updateProfile, refreshUser }),
    [user, loading, error, register, login, logout, updateProfile, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider')
  return ctx
}
