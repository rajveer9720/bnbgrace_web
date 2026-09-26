import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { api, getApiError } from '../lib/api'
import './AgentPage.css'

type Message = { id: string; role: 'user' | 'assistant'; text: string; fallback?: boolean }
type Conversation = { id: string; title: string; messages: Message[] }
type IconName = 'chat' | 'book' | 'spark' | 'send' | 'copy' | 'plus' | 'menu' | 'close' | 'sun' | 'moon'
function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    sun: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8ZM12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5',
    moon: 'M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z',
    chat: 'M21 11a8 8 0 0 1-8 8H8l-5 3V11a9 9 0 0 1 18 0Z',
    book: 'M12 5v16m0-16C9 3 5 3 2 4v15c3-1 7-1 10 2 3-3 7-3 10-2V4c-3-1-7-1-10 1Z',
    spark: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z',
    send: 'M12 19V5m-6 6 6-6 6 6', copy: 'M9 9h12v12H9V9ZM15 5V3H3v12h2',
    plus: 'M12 5v14M5 12h14', menu: 'M4 6h16M4 12h16M4 18h16', close: 'm6 6 12 12M6 18 18 6',
  }
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[name]} /></svg>
}
const starters = [
  { emoji: '☀', title: 'A smooth arrival', detail: 'Check-in times & collecting keys', question: 'What time is check-in, and how do I collect the keys?' },
  { emoji: '⌂', title: 'Feel right at home', detail: 'Wi-Fi, parking & amenities', question: 'What amenities and parking options are available at the property?' },
  { emoji: '♧', title: 'Know before you go', detail: 'Pets, visitors & house rules', question: 'Are pets and visitors allowed at the property?' },
  { emoji: '↗', title: 'Make the most of a stay', detail: 'Local tips & recommendations', question: 'What places do you recommend visiting near the property?' },
]

export default function AgentPage() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try { return localStorage.getItem('bnbgrace-theme') === 'dark' ? 'dark' : 'light' }
    catch { return 'light' }
  })
  useEffect(() => {
    try { localStorage.setItem('bnbgrace-theme', theme) }
    catch { /* Theme still works when browser storage is unavailable. */ }
  }, [theme])
  const [chats, setChats] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [failedQuestion, setFailedQuestion] = useState('')
  const [copyStatus, setCopyStatus] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const busy = useRef(false)
  const input = useRef<HTMLTextAreaElement>(null)
  const end = useRef<HTMLDivElement>(null)
  const active = chats.find((chat) => chat.id === activeId)
  const messages = active?.messages ?? []

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'auto', block: 'end' }) }, [chats, loading, activeId, error])
  useEffect(() => {
    if (input.current) { input.current.style.height = 'auto'; input.current.style.height = `${Math.min(input.current.scrollHeight, 160)}px` }
  }, [question])
  useEffect(() => {
    function close(event: KeyboardEvent) { if (event.key === 'Escape') setSidebarOpen(false) }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [])

  function newChat() {
    if (busy.current) return
    setActiveId(null); setQuestion(''); setError(''); setFailedQuestion(''); setCopyStatus(''); setSidebarOpen(false)
    input.current?.focus()
  }
  function selectChat(id: string) {
    if (busy.current) return
    setActiveId(id); setQuestion(''); setError(''); setFailedQuestion(''); setCopyStatus(''); setSidebarOpen(false)
  }
  async function send(text: string, retry = false) {
    const trimmed = text.trim()
    if (!trimmed || busy.current) return
    busy.current = true
    const chatId = activeId ?? crypto.randomUUID()
    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', text: trimmed }
    if (!activeId) {
      setChats((previous) => [{ id: chatId, title: trimmed, messages: [userMessage] }, ...previous])
      setActiveId(chatId)
    } else if (!retry) {
      setChats((previous) => previous.map((chat) => chat.id === chatId ? { ...chat, messages: [...chat.messages, userMessage] } : chat))
    }
    setLoading(true); setQuestion(''); setError(''); setFailedQuestion(''); setCopyStatus('')
    try {
      const { data } = await api.post<{ reply: string; fallback: boolean }>('/agent/generate-reply', { question: trimmed })
      if (!data || typeof data.reply !== 'string' || !data.reply.trim() || typeof data.fallback !== 'boolean') throw new Error('The assistant returned an invalid reply. Please try again.')
      const reply: Message = { id: crypto.randomUUID(), role: 'assistant', text: data.reply, fallback: data.fallback }
      setChats((previous) => previous.map((chat) => chat.id === chatId ? { ...chat, messages: [...chat.messages, reply] } : chat))
    } catch (cause) { setError(getApiError(cause)); setFailedQuestion(trimmed) }
    finally { busy.current = false; setLoading(false); input.current?.focus() }
  }
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); void send(question) }
  async function copy(message: Message) {
    try { await navigator.clipboard.writeText(message.text); setCopyStatus('Reply copied.') }
    catch { setCopyStatus('Could not copy. Select the reply text and copy it manually.') }
  }

  return (
    <div className="chat-app" data-theme={theme}>
      {sidebarOpen && <button className="chat-backdrop" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside id="chat-sidebar" className={`chat-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="chat-brand-row"><a href="/" className="chat-brand"><span className="chat-logo"><Icon name="spark" /></span>bnbgrace<span className="brand-ai">AI</span></a><button className="chat-icon-button mobile-only" aria-label="Close navigation" onClick={() => setSidebarOpen(false)}><Icon name="close" /></button></div>
        <button className="chat-new" onClick={newChat} disabled={loading}><Icon name="plus" /> New chat <span>↗</span></button>
        <div className="chat-history"><p className="chat-nav-label">YOUR CONVERSATIONS</p>{chats.length ? <nav aria-label="Conversations">{chats.map((chat) => <button key={chat.id} className={`chat-history-item ${chat.id === activeId ? 'selected' : ''}`} aria-current={chat.id === activeId ? 'page' : undefined} disabled={loading} onClick={() => selectChat(chat.id)}><Icon name="chat" /><span>{chat.title}</span></button>)}</nav> : <div className="history-placeholder"><Icon name="chat" /><p>A little space for<br />your conversations.</p><span>Your chats will appear here.</span></div>}</div>
        <div className="chat-sidebar-bottom"><a className="chat-knowledge" href="/admin/knowledge"><Icon name="book" /> Knowledge base <span>↗</span></a><div className="chat-sidebar-tip"><span className="tip-dot" /><div>Made for better stays<p>Answers from your property knowledge.</p></div></div><div className="chat-account"><span className="chat-avatar">AG</span><div><strong>Agent workspace</strong><span>Chats saved for this session</span></div></div></div>
      </aside>
      <main className="chat-main">
        <header className="chat-topbar"><div><button className="chat-icon-button mobile-only" aria-label="Open navigation" aria-expanded={sidebarOpen} aria-controls="chat-sidebar" onClick={() => setSidebarOpen(true)}><Icon name="menu" /></button><span className="chat-model">Grace <span>Assistant</span></span><span className="chat-model-tag">GUEST SUPPORT</span></div><div className="chat-top-actions"><button type="button" className="chat-theme-toggle" aria-label="Dark theme" aria-pressed={theme === 'dark'} title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'} onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}><Icon name={theme === 'dark' ? 'sun' : 'moon'} /><span>{theme === 'dark' ? 'Light' : 'Dark'}</span></button><button className="chat-top-new chat-icon-button" onClick={newChat} disabled={loading} aria-label="Start a new chat"><Icon name="plus" /></button></div></header>
        <div className={`chat-scroll ${messages.length ? 'has-messages' : ''}`}>
          {!messages.length ? <section className="chat-welcome"><div className="welcome-emblem"><Icon name="spark" /></div><p className="welcome-kicker">A LITTLE HELP. A BETTER STAY.</p><h1>How can I help you today?</h1><p className="welcome-description">From first hello to late checkout.<br />Thoughtful answers for every guest question.</p><div className="chat-starters">{starters.map((starter) => <button key={starter.title} onClick={() => { setQuestion(starter.question); input.current?.focus() }}><span className="starter-emoji" aria-hidden="true">{starter.emoji}</span><strong>{starter.title}</strong><span>{starter.detail}</span><span className="starter-arrow" aria-hidden="true">↗</span></button>)}</div></section> : <section className="chat-thread" aria-label="Conversation" role="log" aria-live="polite" aria-relevant="additions text">{messages.map((message) => <article key={message.id} className={`chat-message ${message.role}`} aria-label={message.role === 'user' ? 'You' : 'Grace assistant'}>{message.role === 'assistant' && <span className="message-avatar"><Icon name="spark" /></span>}<div className="message-body">{message.role === 'assistant' && <span className="message-author">Grace</span>}{message.fallback && <p className="chat-fallback">Needs supervisor check</p>}<div className="message-text">{message.text}</div>{message.role === 'assistant' && <button className="message-copy" onClick={() => void copy(message)}><Icon name="copy" /> Copy reply</button>}</div></article>)}{loading && <div className="chat-message assistant"><span className="message-avatar"><Icon name="spark" /></span><div className="chat-thinking" role="status"><span /><span /><span /><small>Preparing your answer</small></div></div>}{error && <div className="chat-error" role="alert"><p>{error}</p><button onClick={() => void send(failedQuestion, true)} disabled={loading}>Try again</button></div>}<div ref={end} /></section>}
        </div>
        <div className="chat-compose-area"><div className="chat-copy-status" role="status">{copyStatus}</div><form className="chat-composer" onSubmit={submit}><label className="sr-only" htmlFor="chat-question">Message Grace</label><textarea ref={input} id="chat-question" rows={1} placeholder="Ask a guest question…" value={question} onChange={(event) => setQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void send(question) } }} /><div className="composer-toolbar"><span><Icon name="book" /> Property knowledge</span><div><span className="enter-hint">Enter to send</span><button type="submit" className="chat-send" disabled={loading || !question.trim()} aria-label={loading ? 'Waiting for reply' : 'Send message'}>{loading ? <span className="send-loading" /> : <Icon name="send" />}</button></div></div></form><p className="chat-disclaimer">Grace answers each question using your knowledge base. Review replies before sharing.</p></div>
      </main>
    </div>
  )
}
