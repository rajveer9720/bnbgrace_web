import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token && !config.headers.Authorization) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401 && localStorage.getItem('accessToken')) {
      window.dispatchEvent(new Event('auth:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) return 'Please sign in with a valid access token.'
    if (error.response?.status === 403) return 'You do not have permission to perform this action.'
    const message = error.response?.data?.message
    if (Array.isArray(message)) return message.join(', ')
    if (typeof message === 'string') return message
    if (!error.response) return 'Cannot reach the local API. Check that the backend is running.'
  }
  return error instanceof Error ? error.message : 'Something went wrong. Please try again.'
}
