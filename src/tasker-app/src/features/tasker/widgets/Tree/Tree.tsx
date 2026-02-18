import React from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import { GlassWidget } from '../../../../components/common/GlassWidget';
import type { WidgetSizeProps } from '../../../../types';
import { type EntityType } from '../../../../utils/entity-links';
import { HierarchyTree } from './HierarchyTree';

export interface TreeProps extends WidgetSizeProps {
  /** Deep link для открытия сущности при загрузке страницы */
  initialDeepLink?: { entityType: EntityType; entityId: string };
  /** Режим встраивания: без обёртки GlassWidget (используется внутри SidebarTabsWidget) */
  embedded?: boolean;
  /** When true, DndContext is provided by a parent component */
  externalDnd?: boolean;
  /** Ref to expose tree's handleDragEnd callback to the parent */
  dragEndRef?: React.MutableRefObject<((event: DragEndEvent) => Promise<void>) | null>;
}

export const Tree: React.FC<TreeProps> = ({ colSpan, rowSpan, initialDeepLink, embedded, externalDnd, dragEndRef }) => {
  // Common hierarchy component handles everything logic-wise
  const hierarchy = (
    <HierarchyTree
      initialDeepLink={initialDeepLink}
      externalDnd={externalDnd}
      dragEndRef={dragEndRef}
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
