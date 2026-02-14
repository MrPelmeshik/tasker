/**
 * Хук для управления участниками области: загрузка, добавление, удаление, смена ролей.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { areaApi } from '../../../services/api/areas';
import { getCurrentUser } from '../../../services/api/auth';
import { useTaskUpdate } from '../../../context';
import { useEvents } from '../../activities/useEvents';
import { canEditArea } from '../../../utils/area-role';
import type { AreaMemberResponse, AreaRole } from '../../../types';

export interface UseAreaMembersOptions {
  isOpen: boolean;
  area: { id: string } | null;
  showError: (error: unknown) => void;
}

export function useAreaMembers({ isOpen, area, showError }: UseAreaMembersOptions) {
  const [originalMembers, setOriginalMembers] = useState<AreaMemberResponse[]>([]);
  const [pendingRoleChanges, setPendingRoleChanges] = useState<Record<string, AreaRole>>({});
  const [pendingAdds, setPendingAdds] = useState<Array<{ login: string; role: AreaRole }>>([]);
  const [pendingRemoves, setPendingRemoves] = useState<Set<string>>(new Set());

  const [membersLoading, setMembersLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [addMemberLogin, setAddMemberLogin] = useState('');
  const [addMemberRole, setAddMemberRole] = useState<AreaRole>('Executor');
  const [addMemberError, setAddMemberError] = useState<string | null>(null);
  const [removeConfirmMember, setRemoveConfirmMember] = useState<AreaMemberResponse | null>(null);

  const areaEvents = useEvents('area', area?.id);
  const { subscribeToTaskUpdates } = useTaskUpdate();
  const [membersRefreshTrigger, setMembersRefreshTrigger] = useState(0);
  const refetchRef = useRef(areaEvents.refetch);
  refetchRef.current = areaEvents.refetch;

  useEffect(() => {
    const unsub = subscribeToTaskUpdates((_taskId, _folderId, payload) => {
      if (payload?.areaId === area?.id) {
        refetchRef.current();
        setMembersRefreshTrigger((t) => t + 1);
      }
    });
    return unsub;
  }, [subscribeToTaskUpdates, area?.id]);

  useEffect(() => {
    if (isOpen) {
      setAddMemberLogin('');
      setAddMemberError(null);
      setRemoveConfirmMember(null);
      setPendingRoleChanges({});
      setPendingAdds([]);
      setPendingRemoves(new Set());
    }
  }, [isOpen, area]);

  useEffect(() => {
    if (!isOpen || !area?.id) {
      setOriginalMembers([]);
      setCurrentUserId(null);
      return;
    }
    let cancelled = false;
    setMembersLoading(true);
    setMembersError(null);
    Promise.all([getCurrentUser(), areaApi.getMembers(area.id)])
      .then(([userRes, membersData]) => {
        if (!cancelled) {
          setCurrentUserId(userRes.success && userRes.data ? userRes.data.id : null);
          setOriginalMembers(membersData);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          const msg = err instanceof Error ? err.message : 'Ошибка загрузки участников';
          setMembersError(msg);
          showError(err);
        }
      })
      .finally(() => {
        if (!cancelled) setMembersLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, area?.id, showError, membersRefreshTrigger]);

  const displayMembers = useMemo(() => {
    const base = originalMembers
      .filter((m) => !pendingRemoves.has(m.userId))
      .map((m) => ({
        ...m,
        role: (pendingRoleChanges[m.userId] ?? m.role) as AreaRole,
      }));
    const fromPending = pendingAdds.map(({ login, role }) => ({
      userId: `pending-${login}`,
      userName: login,
      role: (pendingRoleChanges[`pending-${login}`] ?? role) as AreaRole,
    }));
    return [...base, ...fromPending];
  }, [originalMembers, pendingRemoves, pendingRoleChanges, pendingAdds]);

  const canEdit =
    !area ||
    (!membersLoading &&
      currentUserId != null &&
      originalMembers.some((m) => m.userId === currentUserId && canEditArea(m.role)));

  const handleAddMember = (): void => {
    const login = addMemberLogin.trim();
    if (!login || !area?.id) return;
    setAddMemberError(null);

    if (
      originalMembers.some((m) => m.userName === login) ||
      pendingAdds.some((p) => p.login === login)
    ) {
      setAddMemberError('Этот пользователь уже в области. Измените роль в списке участников.');
      return;
    }

    setPendingAdds((prev) => [...prev, { login, role: addMemberRole }]);
    setAddMemberLogin('');
  };

  const handleChangeMemberRole = (member: AreaMemberResponse, newRole: AreaRole) => {
    if (member.role === 'Owner' || member.role === newRole) return;
    setAddMemberError(null);
    setPendingRoleChanges((prev) => ({ ...prev, [member.userId]: newRole }));
  };

  const handleConfirmRemoveMember = () => {
    const m = removeConfirmMember;
    if (!m) return;
    setRemoveConfirmMember(null);

    if (m.userId.startsWith('pending-')) {
      const login = m.userName;
      setPendingAdds((prev) => prev.filter((p) => p.login !== login));
    } else {
      setPendingRemoves((prev) => new Set([...Array.from(prev), m.userId]));
    }
  };

  const resetPending = () => {
    setPendingRoleChanges({});
    setPendingAdds([]);
    setPendingRemoves(new Set());
  };

  return {
    originalMembers,
    setOriginalMembers,
    pendingRoleChanges,
    pendingAdds,
    pendingRemoves,
    membersLoading,
    membersError,
    addMemberLogin,
    addMemberRole,
    addMemberError,
    setAddMemberLogin,
    setAddMemberRole,
    setAddMemberError,
    removeConfirmMember,
    setRemoveConfirmMember,
    displayMembers,
    canEdit,
    areaEvents,
    handleAddMember,
    handleChangeMemberRole,
    handleConfirmRemoveMember,
    resetPending,
  };
}
