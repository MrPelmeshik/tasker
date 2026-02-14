/**
 * Единый виджет сайдбара с вкладками: дерево, дедлайны, последние активности.
 */

import React, { useState } from 'react';
import { GlassWidget } from '../../../../components/common/GlassWidget';
import { GlassButton } from '../../../../components/ui/GlassButton';
import { Tree } from '../Tree';
import { DeadlinesList } from '../DeadlinesList';
import { LastActionList } from '../LastActionList';
import type { WidgetSizeProps } from '../../../../types';
import type { EntityType } from '../../../../utils/entity-links';
import css from './sidebar-tabs-widget.module.css';

export type SidebarTab = 'tree' | 'deadlines' | 'activities';

export interface SidebarTabsWidgetProps extends WidgetSizeProps {
  /** Deep link для открытия сущности при загрузке страницы (передаётся в Tree) */
  initialDeepLink?: { entityType: EntityType; entityId: string };
}

/** Опции вкладок для панели переключения */
const TAB_OPTIONS: { key: SidebarTab; label: string }[] = [
  { key: 'tree', label: 'Дерево' },
  { key: 'deadlines', label: 'Дедлайны' },
  { key: 'activities', label: 'Активности' },
];

export const SidebarTabsWidget: React.FC<SidebarTabsWidgetProps> = ({
  colSpan,
  rowSpan,
  initialDeepLink,
}) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('tree');

  return (
    <GlassWidget colSpan={colSpan} rowSpan={rowSpan}>
      <div className={css.tabBar}>
        <GlassButton
          toggleGroup
          variant="subtle"
          size="s"
          fullWidth
          equalWidth
          value={activeTab}
          onChange={(v) => setActiveTab(v as SidebarTab)}
          options={TAB_OPTIONS}
        />
      </div>
      <div className={css.content}>
        {activeTab === 'tree' && (
          <div className={css.tabPanel}>
            <Tree embedded initialDeepLink={initialDeepLink} />
          </div>
        )}
        {activeTab === 'deadlines' && (
          <div className={css.tabPanel}>
            <DeadlinesList embedded />
          </div>
        )}
        {activeTab === 'activities' && (
          <div className={css.tabPanel}>
            <LastActionList embedded />
          </div>
        )}
      </div>
    </GlassWidget>
  );
};
