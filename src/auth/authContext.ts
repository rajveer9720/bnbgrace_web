import { createContext, useContext } from 'react'

export type UserRole = 'admin' | 'agent'

export interface AuthUser {
  id: number
  email: string
  role: UserRole
}

export interface AuthContextValue {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  registerAgent: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider.')
  return context
}
