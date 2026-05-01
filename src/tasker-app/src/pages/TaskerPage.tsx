import React, { useCallback, useEffect, useRef, useState } from 'react';
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
import { Tree } from '../features/tasker/widgets/Tree';
import { RealtimeBanner } from '../components/common/RealtimeBanner';
import { useDeepLink } from '../hooks';
import { useToast } from '../context';
import { createSchedule } from '../services/api';
import { collisionDetection, type DragPayload } from '../features/tasker/widgets/Tree/treeUtils';
import { TreeDndOverlay } from '../features/tasker/widgets/Tree/TreeDndOverlay';
import { Z_INDEX_DND_OVERLAY } from '../config/constants';
import { TaskerShellProvider } from '../features/tasker/context/TaskerShellContext';
import { TaskerDetailPanelProvider, RightGlassDetailPanel, useTaskerDetailPanel } from '../features/tasker/context/TaskerDetailPanelContext';
import type { EntityType } from '../utils/entity-links';
import { useTaskerViewMode } from '../features/tasker/context/TaskerViewModeContext';

export const TaskerPage: React.FC = () => {
  const { entityType, entityId } = useDeepLink();
  const initialDeepLink =
    entityType && entityId ? { entityType, entityId } : undefined;

  /** Ключ `entityType:entityId` уже обработанный openEntityByDeepLink (общий для скрытого и видимого дерева). */
  const processedDeepLinkKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!entityType || !entityId) {
      processedDeepLinkKeyRef.current = null;
    }
  }, [entityType, entityId]);

  const { viewMode, setViewMode } = useTaskerViewMode();
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
      <TaskerShellProvider>
        <TaskerDetailPanelProvider>
          <TaskerShellLayout
            viewMode={viewMode}
            setViewMode={setViewMode}
            initialDeepLink={initialDeepLink}
            processedDeepLinkKeyRef={processedDeepLinkKeyRef}
            treeDragEndRef={treeDragEndRef}
            calendarRefetchRef={calendarRefetchRef}
          />
        </TaskerDetailPanelProvider>
      </TaskerShellProvider>

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

const TaskerShellLayout: React.FC<{
  viewMode: 'activities' | 'calendar';
  setViewMode: (mode: 'activities' | 'calendar') => void;
  initialDeepLink?: { entityType: EntityType; entityId: string };
  processedDeepLinkKeyRef: React.MutableRefObject<string | null>;
  treeDragEndRef: React.MutableRefObject<((event: DragEndEvent) => Promise<void>) | null>;
  calendarRefetchRef: React.MutableRefObject<(() => void) | null>;
}> = ({ viewMode, setViewMode, initialDeepLink, processedDeepLinkKeyRef, treeDragEndRef, calendarRefetchRef }) => {
  const { isPanelOpen, isCollapsed } = useTaskerDetailPanel();
  const mainAreaClass = [
    styles.mainArea,
    isPanelOpen && styles.mainAreaWithPanel,
    isPanelOpen && isCollapsed && styles.mainAreaWithPanelCollapsed,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <div className={styles.taskerPageContainer}>
      <div className={styles.bannerWrapper}>
        <RealtimeBanner />
      </div>
      <div className={mainAreaClass}>
        <div className={styles.contentPane}>
          {viewMode === 'activities' && initialDeepLink && (
            <div className={styles.deepLinkTreeHost} aria-hidden>
              <Tree
                embedded
                initialDeepLink={initialDeepLink}
                processedDeepLinkKeyRef={processedDeepLinkKeyRef}
                externalDnd
                dragEndRef={treeDragEndRef}
              />
            </div>
          )}
          {viewMode === 'activities' ? (
            <TaskTable colSpan="full" rowSpan="full" onViewModeChange={() => setViewMode('calendar')} />
          ) : (
            <TaskCalendar
              colSpan="full"
              rowSpan="full"
              onViewModeChange={() => setViewMode('activities')}
              refetchRef={calendarRefetchRef}
              treeContent={
                <Tree
                  embedded
                  initialDeepLink={initialDeepLink}
                  processedDeepLinkKeyRef={processedDeepLinkKeyRef}
                  externalDnd
                  dragEndRef={treeDragEndRef}
                />
              }
            />
          )}
        </div>
        {isPanelOpen && (
          <div className={`${styles.detailPane} ${isCollapsed ? styles.detailPaneCollapsed : ''}`}>
            <RightGlassDetailPanel />
          </div>
        )}
      </div>
    </div>
  );
};
