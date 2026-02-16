import React, { createContext, useContext } from 'react';
import type { AreaShortCard, FolderSummary, TaskSummary } from '../../../../types';
import type { DragPayload } from './treeUtils';

interface TreeContextValue {
    // Data
    areas: AreaShortCard[];
    foldersByArea: Map<string, FolderSummary[]>;
    foldersByParent: Map<string, FolderSummary[]>;
    tasksByArea: Map<string, TaskSummary[]>;
    tasksByFolder: Map<string, TaskSummary[]>;

    // State
    expandedAreas: Set<string>;
    expandedFolders: Set<string>;
    loadingContent: Set<string>;
    activeDrag: { id: string; data: DragPayload } | null;

    // Handlers
    actions: {
        toggleArea: (areaId: string) => void;
        toggleFolder: (folderId: string, areaId: string) => void;
        onViewAreaDetails: (areaId: string, e: React.MouseEvent) => void;
        onViewFolderDetails: (folderId: string, e: React.MouseEvent) => void;
        onViewTaskDetails: (taskId: string, e: React.MouseEvent) => void;
        onCreateFolderForArea: (areaId: string, e: React.MouseEvent) => void;
        onCreateTaskForArea: (areaId: string, e: React.MouseEvent) => void;
        onCreateFolderForFolder: (folderId: string, areaId: string, e: React.MouseEvent) => void;
        onCreateTaskForFolder: (folderId: string, areaId: string, e: React.MouseEvent) => void;
        onSetAreaColor: (areaId: string, hex: string) => void;
    };

    // Utilities
    helpers: {
        filterAndSortTasks: (tasks: TaskSummary[]) => TaskSummary[];
        hasStatusFilter: boolean;
        /** Текущий запрос текстового поиска по задачам  */
        searchQuery: string;
    };
}

const TreeContext = createContext<TreeContextValue | null>(null);

export const useTreeContext = () => {
    const context = useContext(TreeContext);
    if (!context) {
        throw new Error('useTreeContext must be used within a TreeProvider');
    }
    return context;
};

export const TreeProvider = TreeContext.Provider;
