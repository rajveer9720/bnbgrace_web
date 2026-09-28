import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  timeout: 120000,
  prepareHeaders(headers, { endpoint }) {
    const token = localStorage.getItem('accessToken');
    if (token && endpoint !== 'login' && endpoint !== 'register' && !headers.has('Authorization')) headers.set('Authorization', 'Bearer ' + token);
    return headers;
  },
});
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, context, extra) => {
  const token = localStorage.getItem('accessToken');
  const result = await rawBaseQuery(args, context, extra);
  if (result.error?.status === 401 && !['login', 'register', 'verifySession'].includes(context.endpoint) && token && token === localStorage.getItem('accessToken')) {
    window.dispatchEvent(new Event('auth:unauthorized'));
  }
  return result;
};

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Knowledge'],
  endpoints: () => ({}),
});
