import { useEffect, useState } from 'react';
import { adminApi, type Admin } from './api';

// Returns the signed-in admin's role, so the interface can match what the server will allow.
export function useAdminRole(): Admin['role'] | undefined {
  const [role, setRole] = useState<Admin['role'] | undefined>(undefined);
  useEffect(() => {
    adminApi.me().then((r) => setRole(r.admin.role)).catch(() => setRole(undefined));
  }, []);
  return role;
}
