import KnowledgePage from './pages/KnowledgePage'
import AgentPage from './pages/AgentPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import { useAuth } from './auth/authContext'
import './App.css'

export default function App() {
  const { user, isLoading } = useAuth()
  const path = window.location.pathname.replace(/\/$/, '') || '/'

  if (isLoading) return <main className="auth-loading" role="status"><span />Checking your session…</main>
  if (!user) return path === '/signup' ? <SignupPage /> : <LoginPage />
  if (path === '/' || path === '/login') {
    window.history.replaceState({}, '', user.role === 'admin' ? '/admin/knowledge' : '/agent')
    return user.role === 'admin' ? <KnowledgePage /> : <AgentPage />
  }
  if (path === '/agent' && (user.role === 'agent' || user.role === 'admin')) return <AgentPage />
  if (path === '/admin/knowledge' && user.role === 'admin') return <KnowledgePage />
  return (
    <main className="app-shell forbidden-page">
      <p className="eyebrow">ACCESS RESTRICTED</p>
      <h1>You cannot open this page</h1>
      <p>This route is not available for your {user.role} account.</p>
      <a href={user.role === 'admin' ? '/admin/knowledge' : '/agent'}>Go to your workspace</a>
    </main>
  )
}
