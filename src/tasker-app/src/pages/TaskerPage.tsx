import React, { useCallback, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import styles from '../styles/tasker-page.module.css';
import { TaskTable } from '../features/tasker/widgets/TaskTable';
import { TaskCalendar } from '../features/tasker/widgets/TaskCalendar';
import { SidebarTabsWidget } from '../features/tasker/widgets/SidebarTabsWidget';
import { WidgetPanel } from '../components/common/WidgetPanel';
import { RealtimeBanner } from '../components/common/RealtimeBanner';
import { useDeepLink, useWidgetState } from '../hooks';
import { useToast } from '../context';
import { createSchedule } from '../services/api';
import { collisionDetection, type DragPayload } from '../features/tasker/widgets/Tree/treeUtils';
import { TreeDndOverlay } from '../features/tasker/widgets/Tree/TreeDndOverlay';
import { Z_INDEX_DND_OVERLAY } from '../config/constants';

export const TaskerPage: React.FC = () => {
  const { entityType, entityId } = useDeepLink();
  const initialDeepLink =
    entityType && entityId ? { entityType, entityId } : undefined;

  const [viewMode, setViewMode] = useWidgetState<'table' | 'calendar'>('tasker-page', 'viewMode', 'table');
  const { showError } = useToast();

  // DnD state
  const [activeDrag, setActiveDrag] = useState<{ id: string; data: DragPayload } | null>(null);
  const treeDragEndRef = useRef<((event: DragEndEvent) => Promise<void>) | null>(null);
  const calendarRefetchRef = useRef<(() => void) | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current as DragPayload | undefined;
    if (data) setActiveDrag({ id: event.active.id as string, data });
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveDrag(null);
      const { active, over } = event;
      if (!over) return;

      const overId = String(over.id);

      // Calendar slot drop — create schedule
      if (overId.startsWith('calendar-slot-')) {
        const slotData = over.data.current as { type: string; date: string; hour: number } | undefined;
        const payload = active.data.current as DragPayload | undefined;
        if (slotData && payload?.type === 'task' && payload.task) {
          const start = new Date(`${slotData.date}T${String(slotData.hour).padStart(2, '0')}:00:00`);
          const end = new Date(start.getTime() + 3600000); // +1 hour
          try {
            await createSchedule({ taskId: payload.task.id, startAt: start.toISOString(), endAt: end.toISOString() });
            calendarRefetchRef.current?.();
          } catch (e) {
            showError(e);
          }
        }
        return;
      }

      // Otherwise delegate to tree handler
      await treeDragEndRef.current?.(event);
    },
    [showError],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveDrag(null)}
    >
      <div className={styles.taskerPageContainer}>
        <div className={styles.bannerWrapper}>
          <RealtimeBanner />
        </div>
        <div className={styles.mainArea}>
          {viewMode === 'table' ? (
            <TaskTable colSpan="full" rowSpan="full" onViewModeChange={() => setViewMode('calendar')} />
          ) : (
            <TaskCalendar
              colSpan="full"
              rowSpan="full"
              onViewModeChange={() => setViewMode('table')}
              refetchRef={calendarRefetchRef}
            />
          )}
        </div>
        <div className={styles.sidebarArea}>
          <WidgetPanel variant="sidebar">
            <SidebarTabsWidget
              colSpan={1}
              rowSpan={1}
              initialDeepLink={initialDeepLink}
              externalDnd
              dragEndRef={treeDragEndRef}
            />
          </WidgetPanel>
        </div>
      </div>

      {createPortal(
        <DragOverlay zIndex={Z_INDEX_DND_OVERLAY} className="cursor-grabbing">
          {activeDrag?.data.type === 'folder' && activeDrag.data.folder && (
            <TreeDndOverlay type="folder" folder={activeDrag.data.folder} />
          )}
          {activeDrag?.data.type === 'task' && activeDrag.data.task && (
            <TreeDndOverlay type="task" task={activeDrag.data.task} />
          )}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
};
