import { useState, useEffect, useCallback } from 'react';
import { expensesApi } from '@/api/expenses';
import type { Expense, CreateExpensePayload, UpdateExpensePayload } from '@/types';

export function useExpenses(userId: number | null, year: number, month: number) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await expensesApi.getMonthlyExpenses(userId, year, month);
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  }, [userId, year, month]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const createExpense = async (payload: CreateExpensePayload): Promise<Expense> => {
    const expense = await expensesApi.create(payload);
    const d = new Date(expense.dateOfExpense);
    const belongsToView = d.getFullYear() === year && d.getMonth() + 1 === month;
    if (belongsToView) {
      setExpenses((prev) => [expense, ...prev]);
    }
    return expense;
  };

  const updateExpense = async (id: number, payload: UpdateExpensePayload): Promise<Expense> => {
    const updated = await expensesApi.update(id, payload);
    const d = new Date(updated.dateOfExpense);
    const belongsToView = d.getFullYear() === year && d.getMonth() + 1 === month;
    setExpenses((prev) => {
      const without = prev.filter((e) => e.id !== updated.id);
      return belongsToView ? [updated, ...without] : without;
    });
    return updated;
  };

  const deleteExpense = async (id: number, userId: number): Promise<void> => {
    await expensesApi.delete(id, userId);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  return { expenses, loading, error, refetch: fetchExpenses, createExpense, updateExpense, deleteExpense };
}
