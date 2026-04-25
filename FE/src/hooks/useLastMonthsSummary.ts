import { useState, useEffect, useCallback } from 'react';
import { expensesApi } from '@/api/expenses';
import type { LastMonthsSummary } from '@/types';

export function useLastMonthsSummary(userId: number | null, months: number) {
  const [data, setData] = useState<LastMonthsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!userId) { setData(null); return; }
    setLoading(true);
    setError(null);
    try {
      const result = await expensesApi.getLastMonthsSummary(userId, months);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch summary');
    } finally {
      setLoading(false);
    }
  }, [userId, months]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
