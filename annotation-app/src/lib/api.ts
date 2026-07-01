import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { PaginatedResponse, RawTask } from './types';

// Assuming the mock server runs on localhost:4000
const API_BASE = 'http://localhost:4000';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: API_BASE }),
  endpoints: (builder) => ({
    getTasks: builder.query<PaginatedResponse<RawTask>, { page?: number; pageSize?: number }>({
      query: (arg) => {
        const params = new URLSearchParams();
        if (arg.page) params.append('page', String(arg.page));
        if (arg.pageSize) params.append('pageSize', String(arg.pageSize));
        return `/api/tasks?${params.toString()}`;
      },
    }),
    getTaskById: builder.query<RawTask, string>({
      query: (id) => `/api/tasks/${id}`,
    }),
  }),
});

export const { useGetTasksQuery, useGetTaskByIdQuery, usePrefetch } = api;
