import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { TreeFolder } from './TreeFolder';
import { TreeTaskRow } from './TreeTaskRow';
import type { FolderSummary, TaskSummary } from '../../../../types';

interface TreeAreaChildrenProps {
    areaId: string;
    folders: FolderSummary[];
    tasks: TaskSummary[];
    onViewTaskDetails: (taskId: string, e: React.MouseEvent) => void;
}

export const TreeAreaChildren: React.FC<TreeAreaChildrenProps> = React.memo(({
    areaId,
    folders,
    tasks,
    onViewTaskDetails,
}) => {
    return (
        <AnimatePresence initial={false} mode="popLayout">
            {folders.map((f) => (
                <TreeFolder key={f.id} folder={f} areaId={areaId} depth={1} />
            ))}
            {tasks.map((task) => (
                <TreeTaskRow key={task.id} level={2} task={task} onViewDetails={(e) => onViewTaskDetails(task.id, e)} />
            ))}
        </AnimatePresence>
    );
});
