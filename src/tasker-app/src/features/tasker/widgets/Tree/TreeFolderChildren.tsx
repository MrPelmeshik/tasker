import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { TreeFolder } from './TreeFolder';
import { TreeTaskRow } from './TreeTaskRow';
import type { FolderSummary, TaskSummary } from '../../../../types';

interface TreeFolderChildrenProps {
    subfolders: FolderSummary[];
    tasks: TaskSummary[];
    areaId: string;
    depth: number;
    onViewTaskDetails: (taskId: string, e: React.MouseEvent) => void;
}

export const TreeFolderChildren: React.FC<TreeFolderChildrenProps> = React.memo(({
    subfolders,
    tasks,
    areaId,
    depth,
    onViewTaskDetails,
}) => {
    return (
        <AnimatePresence initial={false} mode="popLayout">
            {subfolders.map((sf) => (
                <TreeFolder key={sf.id} folder={sf} areaId={areaId} depth={depth + 1} />
            ))}
            {tasks.map((task) => (
                <TreeTaskRow
                    key={task.id}
                    level={depth + 2}
                    task={task}
                    onViewDetails={(e) => onViewTaskDetails(task.id, e)}
                />
            ))}
        </AnimatePresence>
    );
});
