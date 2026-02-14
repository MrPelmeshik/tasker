import React from 'react';
import { TreeAreaSection } from './TreeAreaSection';
import type { AreaShortCard, FolderSummary, TaskSummary } from '../../../../types';
import type { DragPayload } from './treeUtils';

export interface TreeContentProps {
  areas: AreaShortCard[];
  foldersByArea: Map<string, FolderSummary[]>;
  foldersByParent: Map<string, FolderSummary[]>;
  tasksByArea: Map<string, TaskSummary[]>;
  expandedAreas: Set<string>;
  loadingContent: Set<string>;
  activeDrag: { id: string; data: DragPayload } | null;
  filterAndSortTasks: (tasks: TaskSummary[]) => TaskSummary[];
  hasStatusFilter: boolean;
  onToggleArea: (areaId: string) => void;
  onViewAreaDetails: (areaId: string, e: React.MouseEvent) => void;
  onCreateFolderForArea: (areaId: string, e: React.MouseEvent) => void;
  onCreateTaskForArea: (areaId: string, e: React.MouseEvent) => void;
  onViewTaskDetails: (taskId: string, e: React.MouseEvent) => void;
  renderFolder: (folder: FolderSummary, areaId: string, depth: number) => React.ReactNode;
}

/** Контент дерева: список областей с AreaSection. */
export const TreeContent: React.FC<TreeContentProps> = ({
  areas,
  foldersByArea,
  foldersByParent,
  tasksByArea,
  expandedAreas,
  loadingContent,
  activeDrag,
  filterAndSortTasks,
  hasStatusFilter,
  onToggleArea,
  onViewAreaDetails,
  onCreateFolderForArea,
  onCreateTaskForArea,
  onViewTaskDetails,
  renderFolder,
}) => (
  <>
    {areas.map((area) => {
      const rawTasks = tasksByArea.get(area.id) ?? [];
      const filteredTasks = filterAndSortTasks(rawTasks);
      const folders = foldersByArea.get(area.id) ?? [];
      const displayCount = hasStatusFilter ? folders.length + filteredTasks.length : undefined;
      const totalCount = hasStatusFilter ? area.foldersCount + area.rootTasksCount : undefined;
      return (
        <TreeAreaSection
          key={area.id}
          area={area}
          isExpanded={expandedAreas.has(area.id)}
          folders={folders}
          tasks={filteredTasks}
          isLoading={loadingContent.has(`area:${area.id}`)}
          displayCount={displayCount}
          totalCount={totalCount}
          activeDrag={activeDrag}
          foldersByArea={foldersByArea}
          foldersByParent={foldersByParent}
          onToggle={() => onToggleArea(area.id)}
          onViewDetails={(e) => onViewAreaDetails(area.id, e)}
          onCreateFolder={(e) => onCreateFolderForArea(area.id, e)}
          onCreateTask={(e) => onCreateTaskForArea(area.id, e)}
          onViewTaskDetails={onViewTaskDetails}
          renderFolder={renderFolder}
        />
      );
    })}
  </>
);
