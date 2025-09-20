import React from 'react';
import styles from '../styles/home.module.css';
import { TaskTable } from '../features/tasker/widgets/TaskTable';
import { ActionGraph } from '../features/tasker/widgets/ActionGraph';
import { LastActionList } from '../features/tasker/widgets/LastActionList';
import { AreaGroupHierarchy } from '../features/tasker/widgets/AreaGroupHierarchy';
import { DeadlinesList } from '../features/tasker/widgets/DeadlinesList';
import { WidgetPanel } from '../components/common/WidgetPanel';

export const TaskerPage: React.FC = () => {
  return (
    <div className={styles.homeContainer}>
      <WidgetPanel title="Панель виджетов">
        <TaskTable />
        <ActionGraph />
        <LastActionList />
        <AreaGroupHierarchy />
        <DeadlinesList />
      </WidgetPanel>
    </div>
  );
};
