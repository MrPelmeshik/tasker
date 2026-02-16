import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { useTreeContext } from './TreeContext';
import { TreeFolderRow } from './TreeFolderRow';
import { TreeFolderChildren } from './TreeFolderChildren';
import { matchesSearch, folderHasMatch } from './treeSearchUtils';
import type { FolderSummary } from '../../../../types';
import css from '../../../../styles/tree.module.css';
import glassWidgetStyles from '../../../../styles/glass-widget.module.css';
import { Loader } from '../../../../components/ui/Loader';
import { isValidDrop } from './treeUtils';

interface TreeFolderProps {
    folder: FolderSummary;
    areaId: string;
    depth: number;
}

export const TreeFolder: React.FC<TreeFolderProps> = React.memo(({ folder, areaId, depth }) => {
    const {
        foldersByArea,
        foldersByParent,
        tasksByFolder,
        expandedFolders,
        loadingContent,
        activeDrag,
        actions,
        helpers
    } = useTreeContext();

    const query = (helpers.searchQuery ?? '').trim();
    const allSubfolders = useMemo(() => foldersByParent.get(folder.id) ?? [], [foldersByParent, folder.id]);
    const allRawTasks = useMemo(() => tasksByFolder.get(folder.id) ?? [], [tasksByFolder, folder.id]);

    const subfolders = useMemo(() => {
        if (!query) return allSubfolders;
        return allSubfolders.filter((f) => folderHasMatch(f, query, foldersByParent, tasksByFolder));
    }, [allSubfolders, query, foldersByParent, tasksByFolder]);

    const rawTasksForSort = useMemo(() => {
        if (!query) return allRawTasks;
        return allRawTasks.filter((t) => matchesSearch(t.title, query));
    }, [allRawTasks, query]);

    const tasks = useMemo(() => helpers.filterAndSortTasks(rawTasksForSort), [helpers, rawTasksForSort]);
    const isExpanded = expandedFolders.has(folder.id);
    const isLoading = loadingContent.has(`folder:${folder.id}`);

    const displayCount = helpers.hasStatusFilter ? subfolders.length + tasks.length : undefined;
    const totalCount = helpers.hasStatusFilter ? folder.tasksCount + folder.subfoldersCount : undefined;

    // Droppable logic lifted from Row
    const { setNodeRef, isOver } = useDroppable({ id: `folder-${folder.id}`, data: { folder } });
    const canDrop = isValidDrop(activeDrag?.data, `folder-${folder.id}`, foldersByArea, foldersByParent);

    // We pass data needed for validation/rendering to the row
    // Note: TreeFolderRow uses React.memo, so we should try to keep props stable if possible.
    // But usage of Context in Parent makes passing props cheap (no prop drilling from Root).

    return (
        <motion.div
            ref={setNodeRef}
            layout
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={css.folderBlock}
            style={{ paddingLeft: depth > 1 ? `20px` : undefined }}
        >
            <TreeFolderRow
                folder={folder}
                areaId={areaId}
                depth={depth}
                isExpanded={isExpanded}
                subfolders={subfolders} // Passed for existence check in Row (hasChildren)
                tasks={tasks} // Passed for existence check
                isLoading={isLoading}
                displayCount={displayCount}
                totalCount={totalCount}
                activeDrag={activeDrag}
                isOver={isOver}
                canDrop={canDrop}
                onToggle={() => actions.toggleFolder(folder.id, areaId)}
                onViewDetails={(e) => actions.onViewFolderDetails(folder.id, e)}
                onCreateFolder={(e) => actions.onCreateFolderForFolder(folder.id, areaId, e)}
                onCreateTask={(e) => actions.onCreateTaskForFolder(folder.id, areaId, e)}
            />

            <AnimatePresence initial={false}>
                {isExpanded && (hasChildren(folder, subfolders, tasks) || isLoading) && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className={css.tasksSection}
                        style={{ overflow: 'hidden' }} // Needed for height animation
                    >
                        {isLoading ? (
                            <div className={glassWidgetStyles.placeholder}>
                                <Loader size="s" ariaLabel="Загрузка" />
                            </div>
                        ) : (
                            <TreeFolderChildren
                                subfolders={subfolders}
                                tasks={tasks}
                                areaId={areaId}
                                depth={depth}
                                onViewTaskDetails={(taskId, e) => actions.onViewTaskDetails(taskId, e)}
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});

function hasChildren(folder: FolderSummary, subfolders: FolderSummary[], tasks: any[]) {
    return subfolders.length + tasks.length > 0 || folder.tasksCount + folder.subfoldersCount > 0;
}
