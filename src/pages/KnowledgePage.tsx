import { useState } from "react";
import { useKnowledgeList } from "../hooks/useKnowledge";
import { useAuth } from "../auth/authContext";
import DocumentForm from "../components/knowledge/DocumentForm";
import UrlForm from "../components/knowledge/UrlForm";
import QaForm from "../components/knowledge/QaForm";
import KnowledgeSources from "../components/knowledge/KnowledgeSources";

export default function KnowledgePage() {
  const { user, logout } = useAuth();
  const list = useKnowledgeList();
  const [notice, setNotice] = useState("");

  function clearNotice() {
    setNotice("");
  }

  async function finish(success: boolean, form: HTMLFormElement, message: string) {
    if (!success) return;
    form.reset();
    setNotice(message);
  }

  async function deleteSource(id: number) {
    clearNotice();
    if (await list.deleteSource(id)) setNotice("Source deleted.");
  }

  return (
    <main className="app-shell">
      <header className="knowledge-header">
        <div>
          <p className="eyebrow">BNBGRACE / ADMIN</p>
          <h1>Knowledge base</h1>
          <p>Add the information your assistant needs to help your guests.</p>
          <a href="/agent">Back to reply assistant →</a>
        </div>
        <div className="knowledge-account">
          <span>{user?.email}</span>
          <button type="button" className="secondary" onClick={logout}>
            Log out
          </button>
        </div>
      </header>
      {notice && (
        <div className="notice" role="status">
          {notice}
        </div>
      )}
      <section className="forms" aria-label="Add knowledge">
        <DocumentForm onStart={clearNotice} onSuccess={finish} />
        <UrlForm onStart={clearNotice} onSuccess={finish} />
        <QaForm onStart={clearNotice} onSuccess={finish} />
      </section>
      <KnowledgeSources list={list} onDelete={deleteSource} />
    </main>
  );
}
