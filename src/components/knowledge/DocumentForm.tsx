import type { FormEvent } from "react";
import { useState } from "react";
import { useUploadDoc } from "../../hooks/useKnowledge";
import type { KnowledgeFormProps } from "./types";

const MAX_PDF_SIZE = 20_000_000;

export default function DocumentForm({
  onStart,
  onSuccess,
}: KnowledgeFormProps) {
  const upload = useUploadDoc();
  const [fileError, setFileError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (upload.isPending) return;
    onStart();
    const form = event.currentTarget;
    const file = new FormData(form).get("file");
    if (!(file instanceof File) || !file.size) {
      setFileError("Select a non-empty PDF file.");
      return;
    }
    if (file.size > MAX_PDF_SIZE) {
      setFileError("PDF must be 20 MB or smaller.");
      return;
    }
    setFileError("");
    const success = await upload.mutate(file);
    await onSuccess(success, form, "Document uploaded.");
  }

  return (
    <form
      className="panel"
      aria-busy={upload.isPending}
      onSubmit={handleSubmit}
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
  );
}
