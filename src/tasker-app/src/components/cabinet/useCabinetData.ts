/**
 * Хук для загрузки данных личного кабинета: профиль и области с ролями.
 */

import { useState, useEffect } from 'react';
import { getCurrentUser } from '../../services/api/auth';
import { areaApi } from '../../services/api/areas';
import type { UserInfo, AreaResponse, AreaRole } from '../../types';

export type AreaWithRole = { area: AreaResponse; role: AreaRole | null };

export interface UseCabinetDataOptions {
  isOpen: boolean;
  showError: (error: unknown) => void;
}

export function useCabinetData({ isOpen, showError }: UseCabinetDataOptions) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [areasWithRoles, setAreasWithRoles] = useState<AreaWithRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const ctrl = new AbortController();
    const signal = ctrl.signal;
    let cancelled = false;
    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const [userRes, areasData] = await Promise.all([
          getCurrentUser({ signal }),
          areaApi.getAll({ signal }),
        ]);

        if (cancelled) return;

        if (userRes.success && userRes.data) {
          const userData = userRes.data;
          setUser(userData);

          const areas = Array.isArray(areasData) ? areasData.filter((a: AreaResponse) => a.isActive) : [];
          const membersPromises = areas.map((a: AreaResponse) => areaApi.getMembers(a.id, { signal }));
          const membersResults = await Promise.all(membersPromises);

          if (cancelled) return;

          const withRoles: AreaWithRole[] = areas.map((area: AreaResponse, i: number) => {
            const members = membersResults[i] ?? [];
            const myMember = members.find((m: { userId: string }) => m.userId === userData.id);
            return {
              area,
              role: myMember?.role ?? null,
            };
          });
          setAreasWithRoles(withRoles);
        } else {
          const msg = userRes.message || 'Ошибка загрузки профиля';
          setError(msg);
          showError(msg);
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') return;
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Ошибка загрузки';
          setError(msg);
          showError(err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
      ctrl.abort();
    };
  }, [isOpen, showError]);

  return { user, setUser, areasWithRoles, loading, error };
}
