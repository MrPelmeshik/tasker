import React from 'react';
import { useTreeContext } from './TreeContext';
import { TreeAreaSection } from './TreeAreaSection';

/** Контент дерева: список областей с AreaSection. */
export const TreeContent: React.FC = () => {
  const {
    areas,
    foldersByArea,
    foldersByParent,
    tasksByArea,
    expandedAreas,
    loadingContent,
    activeDrag,
    actions,
    helpers
  } = useTreeContext();

  return (
    <>
      {areas.map((area) => {
        const rawTasks = tasksByArea.get(area.id) ?? [];
        const filteredTasks = helpers.filterAndSortTasks(rawTasks);
        const folders = foldersByArea.get(area.id) ?? [];
        const displayCount = helpers.hasStatusFilter ? folders.length + filteredTasks.length : undefined;
        const totalCount = helpers.hasStatusFilter ? area.foldersCount + area.rootTasksCount : undefined;

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
            onToggle={() => actions.toggleArea(area.id)}
            onViewDetails={(e) => actions.onViewAreaDetails(area.id, e)}
            onCreateFolder={(e) => actions.onCreateFolderForArea(area.id, e)}
            onCreateTask={(e) => actions.onCreateTaskForArea(area.id, e)}
            onViewTaskDetails={actions.onViewTaskDetails}
          />
        );
      })}
    </>
  );
};
