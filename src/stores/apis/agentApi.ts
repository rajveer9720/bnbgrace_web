import { api } from './baseApi';
import type { GenerateReplyDto, GenerateReplyResponse } from '../../types/api';

export const agentApi = api.injectEndpoints({
  endpoints: (build) => ({
    generateReply: build.mutation<GenerateReplyResponse, GenerateReplyDto>({
      query: (body) => ({ url: '/agent/generate-reply', method: 'POST', body }),
    }),
  }),
});

export const { useGenerateReplyMutation } = agentApi;
