import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api, getApiError } from '../lib/api'
import { AuthContext } from './authContext'
import type { AuthUser, UserRole } from './authContext'

function getTokenRole(token: string): UserRole | null {
  try {
    const encoded = token.split('.')[1]
    const normalized = encoded.replace(/-/g, '+').replace(/_/g, '/')
    const payload = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))) as { role?: string }
    return payload.role === 'admin' || payload.role === 'agent' ? payload.role : null
  } catch {
    return null
  }
}

async function verifyToken(token: string, role: UserRole) {
  const { data } = await api.get<{ user: AuthUser }>(`/auth/${role}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!data?.user || data.user.role !== role) throw new Error('Invalid user session.')
  return data.user
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    const token = localStorage.getItem('accessToken')
    const role = token ? getTokenRole(token) : null
    if (!token || !role) {
      localStorage.removeItem('accessToken')
      queueMicrotask(() => { if (active) setIsLoading(false) })
      return () => { active = false }
    }
    void verifyToken(token, role)
      .then((verifiedUser) => { if (active) setUser(verifiedUser) })
      .catch(() => { localStorage.removeItem('accessToken') })
      .finally(() => { if (active) setIsLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    function clearExpiredSession() {
      localStorage.removeItem('accessToken')
      setUser(null)
      window.history.replaceState({}, '', '/login')
    }
    window.addEventListener('auth:unauthorized', clearExpiredSession)
    return () => window.removeEventListener('auth:unauthorized', clearExpiredSession)
  }, [])

  async function login(email: string, password: string) {
    try {
      const { data } = await api.post<{ accessToken: string }>('/auth/login', { email, password })
      if (!data?.accessToken) throw new Error('Login response did not include an access token.')
      const role = getTokenRole(data.accessToken)
      if (!role) throw new Error('The account does not have a valid role.')
      const verifiedUser = await verifyToken(data.accessToken, role)
      localStorage.setItem('accessToken', data.accessToken)
      setUser(verifiedUser)
      return verifiedUser
    } catch (error) {
      throw new Error(getApiError(error))
    }
  }

  async function registerAgent(email: string, password: string) {
    try {
      const { data } = await api.post<{ accessToken: string }>('/auth/register', { email, password })
      if (!data?.accessToken) throw new Error('Signup response did not include an access token.')
      const role = getTokenRole(data.accessToken)
      if (role !== 'agent') throw new Error('New accounts must have the agent role.')
      const verifiedUser = await verifyToken(data.accessToken, role)
      localStorage.setItem('accessToken', data.accessToken)
      setUser(verifiedUser)
      return verifiedUser
    } catch (error) {
      throw new Error(getApiError(error))
    }
  }

  function logout() {
    localStorage.removeItem('accessToken')
    setUser(null)
    window.history.replaceState({}, '', '/login')
  }

  return <AuthContext.Provider value={{ user, isLoading, login, registerAgent, logout }}>{children}</AuthContext.Provider>
}
