import React from 'react';
import { GlassWidget } from '../../../../components/common/GlassWidget';
import type { WidgetSizeProps } from '../../../../types';
import { type EntityType } from '../../../../utils/entity-links';
import { HierarchyTree } from './HierarchyTree';

export interface TreeProps extends WidgetSizeProps {
  /** Deep link для открытия сущности при загрузке страницы */
  initialDeepLink?: { entityType: EntityType; entityId: string };
  /** Режим встраивания: без обёртки GlassWidget (используется внутри SidebarTabsWidget) */
  embedded?: boolean;
}

export const Tree: React.FC<TreeProps> = ({ colSpan, rowSpan, initialDeepLink, embedded }) => {
  // Common hierarchy component handles everything logic-wise
  const hierarchy = (
    <HierarchyTree
      initialDeepLink={initialDeepLink}
    />
  );

  if (embedded) {
    return hierarchy;
  }

  return (
    <GlassWidget colSpan={colSpan} rowSpan={rowSpan} title="Иерархия">
      {hierarchy}
    </GlassWidget>
  );
};
