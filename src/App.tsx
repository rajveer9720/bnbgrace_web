import KnowledgePage from './pages/KnowledgePage'
import './App.css'
import AgentPage from './pages/AgentPage'

export default function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'
  if (path === '/' || path === '/agent') return <AgentPage />
  if (path === '/admin/knowledge') return <KnowledgePage />
  return <main className="app-shell"><h1>Page not found</h1><a href="/admin/knowledge">Go to knowledge</a></main>
}
