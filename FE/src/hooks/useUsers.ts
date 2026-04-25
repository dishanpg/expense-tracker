import { useState, useEffect, useCallback } from 'react';
import { usersApi } from '@/api/users';
import type { User, CreateUserPayload } from '@/types';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const createUser = async (payload: CreateUserPayload): Promise<User> => {
    const user = await usersApi.create(payload);
    setUsers((prev) => [user, ...prev]);
    return user;
  };

  const deleteUser = async (id: number): Promise<void> => {
    await usersApi.remove(id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return { users, loading, error, refetch: fetchUsers, createUser, deleteUser };
}
