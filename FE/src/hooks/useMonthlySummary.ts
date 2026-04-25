import { useState, useEffect, useCallback } from 'react';
import { expensesApi } from '@/api/expenses';
import type { MonthlyExpenseSummary } from '@/types';

export function useMonthlySummary(userId: number | null, year: number, month: number) {
  const [summary, setSummary] = useState<MonthlyExpenseSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) { setSummary(null); return; }
    setLoading(true);
    setError(null);
    try {
      const data = await expensesApi.getMonthlySummary(userId, year, month);
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch summary');
    } finally {
      setLoading(false);
    }
  }, [userId, year, month]);

  useEffect(() => { fetch(); }, [fetch]);

  return { summary, loading, error, refetch: fetch };
}
