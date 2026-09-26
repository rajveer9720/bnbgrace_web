import type { FormEvent } from "react";
import { useAddUrl } from "../../hooks/useKnowledge";
import type { KnowledgeFormProps } from "./types";

export default function UrlForm({ onStart, onSuccess }: KnowledgeFormProps) {
  const addUrl = useAddUrl();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (addUrl.isPending) return;
    onStart();
    const form = event.currentTarget;
    const input = form.elements.namedItem("url");
    if (!(input instanceof HTMLInputElement)) return;
    const url = input.value.trim();
    if (!/^https?:\/\//i.test(url)) {
      input.setCustomValidity("Enter an HTTP or HTTPS URL.");
      input.reportValidity();
      return;
    }
    await onSuccess(await addUrl.mutate(url), form, "URL added.");
  }

  return (
    <form
      className="panel"
      aria-busy={addUrl.isPending}
      onSubmit={handleSubmit}
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
  );
}
