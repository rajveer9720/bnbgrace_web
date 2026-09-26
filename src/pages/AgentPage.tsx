import Icon from "../components/Icon";
import ChatMessage from "../components/chat/ChatMessage";
import { useAgentChat } from "../hooks/useAgentChat";
import "./AgentPage.css";

export default function AgentPage() {
  const {
    user,
    logout,
    theme,
    setTheme,
    chats,
    activeId,
    question,
    setQuestion,
    loading,
    error,
    failedQuestion,
    copyStatus,
    sidebarOpen,
    setSidebarOpen,
    input,
    end,
    messages,
    newChat,
    selectChat,
    send,
    submit,
    copy,
  } = useAgentChat();

  return (
    <div className="chat-app" data-theme={theme}>
      {sidebarOpen && (
        <button
          className="chat-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <aside
        id="chat-sidebar"
        className={`chat-sidebar ${sidebarOpen ? "is-open" : ""}`}
      >
        <div className="chat-brand-row">
          <a href="/" className="chat-brand">
            <span className="chat-logo">
              <Icon name="spark" />
            </span>
            bnbgrace<span className="brand-ai">AI</span>
          </a>
          <button
            className="chat-icon-button mobile-only"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>
        <button className="chat-new" onClick={newChat} disabled={loading}>
          <Icon name="plus" /> New chat <span>↗</span>
        </button>
        <div className="chat-history">
          <p className="chat-nav-label">RECENT CONVERSATIONS</p>
          {chats.length ? (
            <nav aria-label="Recent conversations">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  className={`chat-history-item ${chat.id === activeId ? "selected" : ""}`}
                  aria-current={chat.id === activeId ? "page" : undefined}
                  disabled={loading}
                  onClick={() => selectChat(chat.id)}
                >
                  <Icon name="chat" />
                  <span>{chat.title}</span>
                </button>
              ))}
            </nav>
          ) : (
            <div className="history-placeholder">
              <Icon name="chat" />
              <p>
                A little space for
                <br />
                your conversations.
              </p>
              <span>Your chats will appear here.</span>
            </div>
          )}
        </div>
        <div className="chat-sidebar-bottom">
          {user?.role === "admin" && (
            <a className="chat-knowledge" href="/admin/knowledge">
              <Icon name="book" /> Knowledge base <span>↗</span>
            </a>
          )}
          <div className="chat-sidebar-tip">
            <span className="tip-dot" />
            <div>
              Built for accurate answers
              <p>Answers from your uploaded knowledge.</p>
            </div>
          </div>
          <div className="chat-account">
            <span className="chat-avatar">
              {user?.role === "admin" ? "AD" : "AG"}
            </span>
            <div>
              <strong>{user?.email}</strong>
              <span>
                {user?.role === "admin" ? "Admin workspace" : "Agent workspace"}
              </span>
            </div>
            <button type="button" className="chat-logout" onClick={logout}>
              Log out
            </button>
          </div>
        </div>
      </aside>
      <main className="chat-main">
        <header className="chat-topbar">
          <div>
            <button
              className="chat-icon-button mobile-only"
              aria-label="Open navigation"
              aria-expanded={sidebarOpen}
              aria-controls="chat-sidebar"
              onClick={() => setSidebarOpen(true)}
            >
              <Icon name="menu" />
            </button>
            <span className="chat-model">
              bnbgrace <span>Assistant</span>
            </span>
          </div>
          <div className="chat-top-actions">
            <button
              type="button"
              className="chat-theme-toggle"
              aria-label="Dark theme"
              aria-pressed={theme === "dark"}
              title={
                theme === "dark"
                  ? "Switch to light theme"
                  : "Switch to dark theme"
              }
              onClick={() =>
                setTheme((current) => (current === "dark" ? "light" : "dark"))
              }
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} />
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
            <button
              className="chat-top-new chat-icon-button"
              onClick={newChat}
              disabled={loading}
              aria-label="Start a new chat"
            >
              <Icon name="plus" />
            </button>
          </div>
        </header>
        <div className={`chat-scroll ${messages.length ? "has-messages" : ""}`}>
          {!messages.length ? (
            <section className="chat-welcome">
              <div className="welcome-emblem">
                <Icon name="spark" />
              </div>
              <p className="welcome-kicker">ANSWERS FROM YOUR KNOWLEDGE BASE</p>
              <h1>What would you like to know?</h1>
              <p className="welcome-description">
                Ask about the PDFs, websites and Q&amp;A
                <br />
                added by your administrator.
              </p>
            </section>
          ) : (
            <section
              className="chat-thread"
              aria-label="Conversation"
              role="log"
              aria-live="polite"
              aria-relevant="additions text"
            >
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} onCopy={copy} />
              ))}
              {loading && (
                <div className="chat-message assistant">
                  <span className="message-avatar">
                    <Icon name="spark" />
                  </span>
                  <div className="chat-thinking" role="status">
                    <span />
                    <span />
                    <span />
                    <small>Preparing your answer</small>
                  </div>
                </div>
              )}
              {error && (
                <div className="chat-error" role="alert">
                  <p>{error}</p>
                  <button
                    onClick={() => void send(failedQuestion, true)}
                    disabled={loading}
                  >
                    Try again
                  </button>
                </div>
              )}
              <div ref={end} />
            </section>
          )}
        </div>
        <div className="chat-compose-area">
          <div className="chat-copy-status" role="status">
            {copyStatus}
          </div>
          <form className="chat-composer" onSubmit={submit}>
            <label className="sr-only" htmlFor="chat-question">
              Message bnbgrace
            </label>
            <textarea
              ref={input}
              id="chat-question"
              rows={1}
              placeholder="Ask a question…"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  void send(question);
                }
              }}
            />
            <div className="composer-toolbar">
              <span>
                <Icon name="book" /> Knowledge base
              </span>
              <div>
                <span className="enter-hint">Enter to send</span>
                <button
                  type="submit"
                  className="chat-send"
                  disabled={loading || !question.trim()}
                  aria-label={loading ? "Waiting for reply" : "Send message"}
                >
                  {loading ? (
                    <span className="send-loading" />
                  ) : (
                    <Icon name="send" />
                  )}
                </button>
              </div>
            </div>
          </form>
          <p className="chat-disclaimer">
            bnbgrace answers using your uploaded knowledge. Review replies
            before sharing.
          </p>
        </div>
      </main>
    </div>
  );
}
