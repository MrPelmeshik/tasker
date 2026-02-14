/**
 * Хук для парсинга deep link из URL.
 * Определяет entityType и entityId по текущему пути.
 */
import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import type { EntityType } from '../utils/entity-links';

const DEEP_LINK_REGEX = /^\/tasker\/(area|folder|task)\/([^/]+)$/;

export interface DeepLinkResult {
  entityType: EntityType | null;
  entityId: string | null;
}

export function useDeepLink(): DeepLinkResult {
  const { pathname } = useLocation();
  return useMemo(() => {
    const match = pathname.match(DEEP_LINK_REGEX);
    if (match) {
      return {
        entityType: match[1] as EntityType,
        entityId: match[2],
      };
    }
    return { entityType: null, entityId: null };
  }, [pathname]);
}
