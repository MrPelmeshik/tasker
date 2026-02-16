import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { AnimatePresence, motion } from 'framer-motion';
import { useTreeContext } from './TreeContext';
import { TreeFolderRow } from './TreeFolderRow';
import { TreeTaskRow } from './TreeTaskRow';
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

    const subfolders = useMemo(() => foldersByParent.get(folder.id) ?? [], [foldersByParent, folder.id]);
    const rawTasks = useMemo(() => tasksByFolder.get(folder.id) ?? [], [tasksByFolder, folder.id]);
    const tasks = useMemo(() => helpers.filterAndSortTasks(rawTasks), [helpers, rawTasks]);
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
                            <AnimatePresence initial={false} mode="popLayout">
                                {subfolders.map((sf) => (
                                    <TreeFolder key={sf.id} folder={sf} areaId={areaId} depth={depth + 1} />
                                ))}
                                {tasks.map((task) => (
                                    <TreeTaskRow
                                        key={task.id}
                                        level={depth + 2}
                                        task={task}
                                        onViewDetails={(e) => actions.onViewTaskDetails(task.id, e)}
                                    />
                                ))}
                            </AnimatePresence>
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
