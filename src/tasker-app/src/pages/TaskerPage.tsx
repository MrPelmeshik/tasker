import React from 'react';
import styles from '../styles/tasker-page.module.css';
import { TaskTable } from '../features/tasker/widgets/TaskTable';
import { SidebarTabsWidget } from '../features/tasker/widgets/SidebarTabsWidget';
import { WidgetPanel } from '../components/common/WidgetPanel';
import { RealtimeBanner } from '../components/common/RealtimeBanner';
import { useDeepLink } from '../hooks';

export const TaskerPage: React.FC = () => {
  const { entityType, entityId } = useDeepLink();
  const initialDeepLink =
    entityType && entityId ? { entityType, entityId } : undefined;

  return (
    <div className={styles.taskerPageContainer}>
      <div className={styles.bannerWrapper}>
        <RealtimeBanner />
      </div>
      <div className={styles.mainArea}>
        <TaskTable colSpan="full" rowSpan="full" />
      </div>
      <div className={styles.sidebarArea}>
        <WidgetPanel variant="sidebar">
          <SidebarTabsWidget colSpan={1} rowSpan={1} initialDeepLink={initialDeepLink} />
        </WidgetPanel>
      </div>
    </div>
  );
};
