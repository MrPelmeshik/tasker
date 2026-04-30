import { useMemo, useCallback } from 'react';
import { useWidgetState } from '../../../../hooks/useWidgetState';

/**
 * <summary>
 * Персистентное состояние раскрытия дерева (области и папки) через useWidgetState.
 * Общее для HierarchyTree и TaskTable; ключи localStorage не менялись относительно прежнего useTreeData.
 * </summary>
 */
export function useTreeExpandState() {
  const [expandedAreasList, setExpandedAreasList] = useWidgetState<string[]>('tree', 'expanded-areas', []);
  const [expandedFoldersList, setExpandedFoldersList] = useWidgetState<string[]>('tree', 'expanded-folders', []);

  const expandedAreas = useMemo(() => new Set(expandedAreasList), [expandedAreasList]);
  const expandedFolders = useMemo(() => new Set(expandedFoldersList), [expandedFoldersList]);

  const setExpandedAreas = useCallback((value: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    setExpandedAreasList((prevList) => {
      const prevSet = new Set(prevList);
      const nextSet = value instanceof Function ? value(prevSet) : value;
      return Array.from(nextSet);
    });
  }, [setExpandedAreasList]);

  const setExpandedFolders = useCallback((value: Set<string> | ((prev: Set<string>) => Set<string>)) => {
    setExpandedFoldersList((prevList) => {
      const prevSet = new Set(prevList);
      const nextSet = value instanceof Function ? value(prevSet) : value;
      return Array.from(nextSet);
    });
  }, [setExpandedFoldersList]);

  return {
    expandedAreas,
    expandedFolders,
    setExpandedAreas,
    setExpandedFolders,
  };
}
