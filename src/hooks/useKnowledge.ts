import { useRef } from 'react';
import { useUploadDocumentMutation, useAddUrlMutation, useAddQaMutation, useGetKnowledgeQuery, useDeleteKnowledgeMutation } from '../stores/apis/knowledgeApi';
import { getApiError } from '../utils/api-error.util';
import type { AddQaDto } from '../types/api';
export type { KnowledgeSource } from '../types/api';

function useMutationResult<T>(trigger: (value: T) => { unwrap: () => Promise<unknown> }, state: { isLoading: boolean; error?: unknown }) {
  const busy = useRef(false);
  async function mutate(value: T): Promise<boolean> {
    if (busy.current) return false;
    busy.current = true;
    try { await trigger(value).unwrap(); return true; }
    catch { return false; }
    finally { busy.current = false; }
  }
  return { mutate, isPending: state.isLoading, error: state.error ? getApiError(state.error) : null };
}
export function useUploadDoc() {
  const [trigger, state] = useUploadDocumentMutation();
  return useMutationResult<File>(trigger, state);
}
export function useAddUrl() {
  const [trigger, state] = useAddUrlMutation();
  return useMutationResult<string>(url => trigger({url}), state);
}
export function useAddQa() {
  const [trigger, state] = useAddQaMutation();
  return useMutationResult<AddQaDto>(trigger, state);
}
export function useKnowledgeList() {
  const query = useGetKnowledgeQuery();
  const [trigger, state] = useDeleteKnowledgeMutation();
  const deletion = useMutationResult<number>(trigger, state);
  return { sources: query.data ?? [], isLoading: query.isFetching,
    error: query.error ? getApiError(query.error) : null,
    refresh: async () => { await query.refetch(); },
    deleteSource: deletion.mutate, isDeleting: deletion.isPending, deleteError: deletion.error };
}
