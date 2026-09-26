import type { FormEvent } from "react";
import { useState } from "react";
import { useAddQa } from "../../hooks/useKnowledge";
import type { KnowledgeFormProps } from "./types";

export default function QaForm({ onStart, onSuccess }: KnowledgeFormProps) {
  const addQa = useAddQa();
  const [validationError, setValidationError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (addQa.isPending) return;
    onStart();
    setValidationError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const question = String(data.get("question") ?? "").trim();
    const answer = String(data.get("answer") ?? "").trim();
    if (!question || !answer) {
      setValidationError("Enter a question and answer with non-empty text.");
      return;
    }
    await onSuccess(
      await addQa.mutate({ question, answer }),
      form,
      "Q&A added.",
    );
  }

  return (
    <form
      className="panel"
      aria-busy={addQa.isPending}
      onSubmit={handleSubmit}
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
      {validationError && <p className="error" role="alert">{validationError}</p>}
      {addQa.error && (
        <p className="error" role="alert">
          {addQa.error}
        </p>
      )}
      <button disabled={addQa.isPending}>
        {addQa.isPending ? "Saving…" : "Save Q&A"}
      </button>
    </form>
  );
}
