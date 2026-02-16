import React, { useMemo } from 'react';
import { useTreeContext } from './TreeContext';
import { TreeAreaSection } from './TreeAreaSection';
import { matchesSearch, folderHasMatch } from './treeSearchUtils';
import glassWidgetStyles from '../../../../styles/glass-widget.module.css';

/** Контент дерева: список областей с AreaSection. */
export const TreeContent: React.FC = () => {
  const {
    areas,
    foldersByArea,
    foldersByParent,
    tasksByArea,
    tasksByFolder,
    expandedAreas,
    loadingContent,
    activeDrag,
    actions,
    helpers
  } = useTreeContext();

  const query = (helpers.searchQuery ?? '').trim();

  /** При активном поиске — области, корневые папки и задачи отфильтрованы по запросу */
  const filteredAreasWithChildren = useMemo(() => {
    if (!query) {
      return areas.map((area) => {
        const folders = foldersByArea.get(area.id) ?? [];
        const rawTasks = tasksByArea.get(area.id) ?? [];
        return { area, folders, rawTasks };
      });
    }
    return areas
      .filter((area) => {
        if (matchesSearch(area.title, query)) return true;
        const rootFolders = foldersByArea.get(area.id) ?? [];
        const rootTasks = tasksByArea.get(area.id) ?? [];
        if (rootTasks.some((t) => matchesSearch(t.title, query))) return true;
        return rootFolders.some((f) => folderHasMatch(f, query, foldersByParent, tasksByFolder));
      })
      .map((area) => {
        const rootFolders = foldersByArea.get(area.id) ?? [];
        const rootTasks = tasksByArea.get(area.id) ?? [];
        const folders = query ? rootFolders.filter((f) => folderHasMatch(f, query, foldersByParent, tasksByFolder)) : rootFolders;
        const rawTasks = query ? rootTasks.filter((t) => matchesSearch(t.title, query)) : rootTasks;
        return { area, folders, rawTasks };
      });
  }, [areas, foldersByArea, foldersByParent, tasksByArea, tasksByFolder, query]);

  if (query && filteredAreasWithChildren.length === 0) {
    return (
      <div className={glassWidgetStyles.placeholder}>Ничего не найдено</div>
    );
  }

  return (
    <>
      {filteredAreasWithChildren.map(({ area, folders, rawTasks }) => {
        const filteredTasks = helpers.filterAndSortTasks(rawTasks);
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
            onSetAreaColor={actions.onSetAreaColor}
          />
        );
      })}
    </>
  );
};
