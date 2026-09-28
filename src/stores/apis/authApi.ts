import { api } from './baseApi';
import type { CredentialsDto, TokenResponse, SessionDto, SessionResponse } from '../../types/api';

export const authApi = api.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<TokenResponse, CredentialsDto>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: build.mutation<TokenResponse, CredentialsDto>({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    verifySession: build.mutation<SessionResponse, SessionDto>({
      query: ({ token, role }) => ({
        url: `/auth/${role}`,
        headers: { Authorization: `Bearer ${token}` },
      }),
    }),
  }),
});

export const { useLoginMutation, useRegisterMutation, useVerifySessionMutation } = authApi;
