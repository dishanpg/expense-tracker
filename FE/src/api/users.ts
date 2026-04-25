import { api } from './client';
import type { User, CreateUserPayload } from '@/types';

export const usersApi = {
  getAll: () => api.get<User[]>('/v1/api/users'),
  getOne: (id: number) => api.get<User>(`/v1/api/users/${id}`),
  create: (payload: CreateUserPayload) =>
    api.post<User>('/v1/api/users', payload),
  update: (id: number, payload: Partial<CreateUserPayload>) =>
    api.patch<User>(`/v1/api/users/${id}`, payload),
  remove: (id: number) => api.delete<void>(`/v1/api/users/${id}`),
};
