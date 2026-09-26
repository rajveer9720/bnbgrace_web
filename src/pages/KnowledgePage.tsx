import { useState } from "react";
import {
  useAddQa,
  useAddUrl,
  useKnowledgeList,
  useUploadDoc,
} from "../hooks/useKnowledge";
import { useAuth } from "../auth/authContext";

const MAX_PDF_SIZE = 20_000_000;

export default function KnowledgePage() {
  const { user, logout } = useAuth();
  const upload = useUploadDoc();
  const addUrl = useAddUrl();
  const addQa = useAddQa();
  const list = useKnowledgeList();
  const [notice, setNotice] = useState("");
  const [fileError, setFileError] = useState("");

  async function finish(
    success: boolean,
    form: HTMLFormElement,
    message: string,
  ) {
    if (!success) return;
    form.reset();
    setNotice(message);
    await list.refresh();
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
        <form
          className="panel"
          onSubmit={async (event) => {
            event.preventDefault();
            setNotice("");
            const form = event.currentTarget;
            const file = new FormData(form).get("file");
            if (!(file instanceof File) || !file.size) {
              setNotice("Select a non-empty PDF file.");
              return;
            }
            if (file.size > MAX_PDF_SIZE) {
              setFileError("PDF must be 20 MB or smaller.");
              return;
            }
            setFileError("");
            const success = await upload.mutate(file);
            await finish(success, form, "Document uploaded.");
          }}
        >
          <span className="eyebrow">01 / DOCUMENT</span>
          <h2>Upload a file</h2>
          <p>Add a text-based PDF up to 20 MB.</p>
          <label>
            Document
            <input
              name="file"
              type="file"
              accept=".pdf,application/pdf"
              required
              disabled={upload.isPending}
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                setFileError(
                  file && file.size > MAX_PDF_SIZE
                    ? "PDF must be 20 MB or smaller."
                    : "",
                );
              }}
            />
          </label>
          {fileError && (
            <p className="error" role="alert">
              {fileError}
            </p>
          )}
          {upload.error && (
            <p className="error" role="alert">
              {upload.error}
            </p>
          )}
          <button disabled={upload.isPending}>
            {upload.isPending ? "Uploading…" : "Upload document"}
          </button>
        </form>
        <form
          className="panel"
          onSubmit={async (event) => {
            event.preventDefault();
            setNotice("");
            const form = event.currentTarget;
            const input = form.elements.namedItem("url") as HTMLInputElement;
            const url = input.value.trim();
            if (!/^https?:\/\//i.test(url)) {
              input.setCustomValidity("Enter an HTTP or HTTPS URL.");
              input.reportValidity();
              return;
            }
            await finish(await addUrl.mutate(url), form, "URL added.");
          }}
        >
          <span className="eyebrow">02 / WEBSITE</span>
          <h2>Add a URL</h2>
          <p>Connect a page your assistant can learn from.</p>
          <label>
            Website URL
            <input
              name="url"
              type="url"
              placeholder="https://example.com/guest-guide"
              required
              disabled={addUrl.isPending}
              onInput={(event) => event.currentTarget.setCustomValidity("")}
            />
          </label>
          {addUrl.error && (
            <p className="error" role="alert">
              {addUrl.error}
            </p>
          )}
          <button disabled={addUrl.isPending}>
            {addUrl.isPending ? "Adding…" : "Add URL"}
          </button>
        </form>
        <form
          className="panel"
          onSubmit={async (event) => {
            event.preventDefault();
            setNotice("");
            const form = event.currentTarget;
            const data = new FormData(form);
            const question = String(data.get("question")).trim();
            const answer = String(data.get("answer")).trim();
            if (!question || !answer) {
              setNotice("Enter a question and answer with non-empty text.");
              return;
            }
            await finish(
              await addQa.mutate({ question, answer }),
              form,
              "Q&A added.",
            );
          }}
        >
          <span className="eyebrow">03 / Q&A</span>
          <h2>Add an answer</h2>
          <p>Give a clear answer to a common question.</p>
          <label>
            Question
            <input
              name="question"
              placeholder="What time is check-in?"
              required
              disabled={addQa.isPending}
            />
          </label>
          <label>
            Answer
            <textarea
              name="answer"
              placeholder="Check-in starts at 2 PM."
              rows={3}
              required
              disabled={addQa.isPending}
            />
          </label>
          {addQa.error && (
            <p className="error" role="alert">
              {addQa.error}
            </p>
          )}
          <button disabled={addQa.isPending}>
            {addQa.isPending ? "Saving…" : "Save Q&A"}
          </button>
        </form>
      </section>
      <section className="panel sources" aria-labelledby="sources-heading">
        <div className="section-heading">
          <div>
            <h2 id="sources-heading">Knowledge sources</h2>
            <p>{list.sources.length} sources in your library</p>
          </div>
          <button
            className="secondary"
            onClick={() => void list.refresh()}
            disabled={list.isLoading}
          >
            Refresh
          </button>
        </div>
        {list.error && (
          <p className="error" role="alert">
            {list.error}
          </p>
        )}
        {list.deleteError && (
          <p className="error" role="alert">
            {list.deleteError}
          </p>
        )}
        <div className="table-scroll" aria-busy={list.isLoading}>
          <table>
            <thead>
              <tr>
                <th>Source</th>
                <th>Type</th>
                <th>Original reference</th>
                <th>Added</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {list.sources.map((source) => (
                <tr key={source.id}>
                  <td>{source.title}</td>
                  <td>
                    <span className="badge">
                      {source.type === "qa"
                        ? "Q&A"
                        : source.type?.toUpperCase()}
                    </span>
                  </td>
                  <td className="reference">{source.originalRef || "—"}</td>
                  <td>
                    {source.createdAt &&
                    !Number.isNaN(Date.parse(source.createdAt))
                      ? new Date(source.createdAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <button
                      className="delete"
                      disabled={list.isDeleting}
                      aria-label={`Delete ${source.title}`}
                      onClick={async () => {
                        setNotice("");
                        if (await list.deleteSource(source.id))
                          setNotice("Source deleted.");
                      }}
                    >
                      {list.isDeleting ? "Please wait…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
              {!list.sources.length && (
                <tr>
                  <td colSpan={5} className="empty">
                    {list.isLoading
                      ? "Loading sources…"
                      : list.error
                        ? "Sources could not be loaded."
                        : "No knowledge yet. Add your first source above."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
