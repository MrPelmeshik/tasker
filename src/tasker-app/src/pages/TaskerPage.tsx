import React from 'react';
import styles from '../styles/tasker-page.module.css';
import { TaskTable } from '../features/tasker/widgets/TaskTable';
import { ActionGraph } from '../features/tasker/widgets/ActionGraph';
import { LastActionList } from '../features/tasker/widgets/LastActionList';
import { Tree } from '../features/tasker/widgets/Tree';
import { DeadlinesList } from '../features/tasker/widgets/DeadlinesList';
import { WidgetPanel } from '../components/common/WidgetPanel';
import { WidgetPlaceholder } from '../components/common/WidgetPlaceholder';
import { RealtimeBanner } from '../components/common/RealtimeBanner';

export const TaskerPage: React.FC = () => {
  const layout = {
    placeholder1: { colSpan: 8 as const, rowSpan: 1 as const },
    taskTable: { colSpan: 4 as const, rowSpan: 5 as const },
    deadlinesList: { colSpan: 2 as const, rowSpan: 3 as const },
    tree: { colSpan: 2 as const, rowSpan: 3 as const },
    lastActionList: { colSpan: 2 as const, rowSpan: 6 as const },
    actionGraph: { colSpan: 4 as const, rowSpan: 1 as const },
  };
  return (
    <div className={styles.taskerPageContainer}>
      <RealtimeBanner />
      <WidgetPanel>
        <WidgetPlaceholder {...layout.placeholder1} />
        <TaskTable {...layout.taskTable} />
        <DeadlinesList {...layout.deadlinesList} />
        <LastActionList {...layout.lastActionList} />
        <Tree {...layout.tree} />
        <ActionGraph {...layout.actionGraph} />
      </WidgetPanel>
    </div>
  );
};
