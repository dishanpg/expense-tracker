import { api } from './client';
import type {
  Expense,
  MonthlyExpenseSummary,
  LastMonthsSummary,
  CreateExpensePayload,
  UpdateExpensePayload,
} from '@/types';

export const expensesApi = {
  getMonthlyExpenses: (userId: number, year?: number, month?: number) => {
    const params = new URLSearchParams({ userId: String(userId) });
    if (year) params.append('year', String(year));
    if (month) params.append('month', String(month));
    return api.get<Expense[]>(`/v1/api/expenses/monthly?${params}`);
  },

  getMonthlySummary: (userId: number, year: number, month: number) =>
    api.post<MonthlyExpenseSummary>('/v1/api/expenses/monthly-summary', {
      userId,
      year,
      month,
    }),

  getLastMonthsSummary: (userId: number, months: number) =>
    api.post<LastMonthsSummary>('/v1/api/expenses/last-months-summary', { userId, months }),

  getOne: (id: number) => api.get<Expense>(`/v1/api/expenses/${id}`),

  create: (payload: CreateExpensePayload) =>
    api.post<Expense>('/v1/api/expenses', payload),

  update: (id: number, payload: UpdateExpensePayload) =>
    api.patch<Expense>(`/v1/api/expenses/${id}`, payload),

  delete: (id: number, userId: number) =>
    api.delete<void>(`/v1/api/expenses/${id}`, { userId }),
};
