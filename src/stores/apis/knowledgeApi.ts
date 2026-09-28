import { api } from './baseApi';
import type { AddQaDto, AddUrlDto, KnowledgeSource } from '../../types/api';

export const knowledgeApi = api.injectEndpoints({
  endpoints: (build) => ({
    getKnowledge: build.query<KnowledgeSource[], void>({
      query: () => '/knowledge',
      providesTags: ['Knowledge'],
    }),
    addQa: build.mutation<KnowledgeSource, AddQaDto>({
      query: (body) => ({ url: '/knowledge/qa', method: 'POST', body }),
      invalidatesTags: (_data, error) => error ? [] : ['Knowledge'],
    }),
    addUrl: build.mutation<KnowledgeSource, AddUrlDto>({
      query: (body) => ({ url: '/knowledge/url', method: 'POST', body }),
      invalidatesTags: (_data, error) => error ? [] : ['Knowledge'],
    }),
    uploadDocument: build.mutation<KnowledgeSource, File>({
      query: (file) => {
        const body = new FormData();
        body.append('file', file);
        return { url: '/knowledge/upload', method: 'POST', body };
      },
      invalidatesTags: (_data, error) => error ? [] : ['Knowledge'],
    }),
    deleteKnowledge: build.mutation<{ deleted: boolean }, number>({
      query: (id) => ({ url: `/knowledge/${id}`, method: 'DELETE' }),
      invalidatesTags: (_data, error) => error ? [] : ['Knowledge'],
    }),
  }),
});

export const {
  useGetKnowledgeQuery,
  useAddQaMutation,
  useAddUrlMutation,
  useUploadDocumentMutation,
  useDeleteKnowledgeMutation,
} = knowledgeApi;
