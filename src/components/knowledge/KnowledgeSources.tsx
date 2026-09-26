import type { useKnowledgeList } from "../../hooks/useKnowledge";

interface KnowledgeSourcesProps {
  list: ReturnType<typeof useKnowledgeList>;
  onDelete: (id: number) => Promise<void>;
}

export default function KnowledgeSources({ list, onDelete }: KnowledgeSourcesProps) {
  return (
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
                      await onDelete(source.id);
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
  );
}
