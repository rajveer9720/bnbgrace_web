import { useCallback, useEffect, useRef, useState } from "react";
import { api, getApiError } from "../lib/api";

export interface KnowledgeSource {
  id: number;
  type: "pdf" | "url" | "qa";
  title: string;
  originalRef: string;
  createdAt: string;
}

export const knowledgeEndpoints = {
  list: "/knowledge",
  upload: "/knowledge/upload",
  url: "/knowledge/url",
  qa: "/knowledge/qa",
  delete: (id: number) => `/knowledge/${id}`,
};

function useMutation<T>(action: (value: T) => Promise<unknown>) {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const busy = useRef(false);
  const mutate = async (value: T) => {
    if (busy.current) return false;
    busy.current = true;
    setIsPending(true);
    setError(null);
    try {
      await action(value);
      return true;
    } catch (error) {
      setError(getApiError(error));
      return false;
    } finally {
      busy.current = false;
      setIsPending(false);
    }
  };
  return { mutate, isPending, error };
}

export function useUploadDoc() {
  return useMutation((file: File) => {
    const data = new FormData();
    data.append("file", file);
    return api.post(knowledgeEndpoints.upload, data);
  });
}

export function useAddUrl() {
  return useMutation((url: string) =>
    api.post(knowledgeEndpoints.url, { url }),
  );
}

export function useAddQa() {
  return useMutation((data: { question: string; answer: string }) =>
    api.post(knowledgeEndpoints.qa, data),
  );
}

export function useKnowledgeList() {
  const [sources, setSources] = useState<KnowledgeSource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const refresh = useCallback(async () => {
    const current = ++requestId.current;
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get(knowledgeEndpoints.list);
      const rows = Array.isArray(data) ? data : data?.knowledge_sources;
      if (
        !Array.isArray(rows) ||
        !rows.every(
          (row) =>
            row && typeof row.id === "number" && typeof row.title === "string",
        )
      ) {
        throw new Error(
          "The API did not return knowledge sources. The backend list endpoint needs to return a source array.",
        );
      }
      if (current === requestId.current) setSources(rows);
    } catch (error) {
      if (current === requestId.current) setError(getApiError(error));
    } finally {
      if (current === requestId.current) setIsLoading(false);
    }
  }, []);
  const invalidate = useCallback(() => {
    requestId.current++;
  }, []);
  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void refresh();
    });
    return () => {
      active = false;
      invalidate();
    };
  }, [refresh, invalidate]);
  const deletion = useMutation(async (id: number) => {
    await api.delete(knowledgeEndpoints.delete(id));
    await refresh();
  });
  return {
    sources,
    isLoading,
    error,
    refresh,
    deleteSource: deletion.mutate,
    isDeleting: deletion.isPending,
    deleteError: deletion.error,
  };
}
