import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { type EntityType } from '../../../../utils/entity-links';
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
import { Z_INDEX_DND_OVERLAY } from '../../../../config/constants';
import { Loader } from '../../../../components/ui/Loader';
import { useModal, useTaskUpdate, useToast } from '../../../../context';
import {
    collisionDetection,
    filterTasksByStatus,
    sortTasks,
    type DragPayload,
} from './treeUtils';
import { matchesSearch, folderHasMatch } from './treeSearchUtils';
import { useTreeData } from './useTreeData';
import { useTreeHandlers } from './useTreeHandlers';
import { useTreeFilters } from './useTreeFilters';
import { useTreeDeepLink } from './useTreeDeepLink';
import { useTreeDragEnd } from './useTreeDragEnd';
import { TreeDndOverlay } from './TreeDndOverlay';
import { TreeToolbar } from './TreeToolbar';
import { TreeEmpty } from './TreeEmpty';
import { TreeContent } from './TreeContent';
import { TreeProvider } from './TreeContext';
import { TreeAreaChildren } from './TreeAreaChildren';
import { TreeFolderChildren } from './TreeFolderChildren';
import glassWidgetStyles from '../../../../styles/glass-widget.module.css';
import css from '../../../../styles/tree.module.css';

export interface HierarchyTreeProps {
    /** 
     * Root entity to display hierarchy for. 
     * If null/undefined, displays all areas (root of the world).
     */
    root?: { type: 'area' | 'folder'; id: string; areaId?: string } | null;
    /**
     * If provided, used for highlighting or scrolling to specific entity.
     */
    initialDeepLink?: { entityType: EntityType; entityId: string };
    className?: string;
    /**
     * Optional callback overrides or additional props can be added here
     */
}

export const HierarchyTree: React.FC<HierarchyTreeProps> = ({ root, initialDeepLink, className }) => {
    const { openAreaModal, openFolderModal, openTaskModal } = useModal();
    const { notifyTaskUpdate, subscribeToTaskUpdates } = useTaskUpdate();
    const { showError, addSuccess } = useToast();

    const treeData = useTreeData({
        showError,
        subscribeToTaskUpdates,
        root,
    });

    const {
        areas,
        setAreas,
        setFoldersByArea,
        setFoldersByParent,
        setTasksByArea,
        setTasksByFolder,
        setExpandedAreas,
        setExpandedFolders,
        loadFolderContent,
        loadAreaContent,
        foldersByArea,
        foldersByParent,
        tasksByArea,
        tasksByFolder,
        expandedAreas,
        expandedFolders,
        loading,
        loadingContent,
        toggleArea,
        toggleFolder,
        expandAll,
        collapseAll,
        isAllExpanded,
    } = treeData;

    const handlers = useTreeHandlers({
        areas,
        setAreas,
        setFoldersByArea,
        setFoldersByParent,
        setTasksByArea,
        setTasksByFolder,
        setExpandedAreas,
        setExpandedFolders,
        loadFolderContent,
        foldersByParent,
        showError,
        addSuccess,
        notifyTaskUpdate,
        openAreaModal,
        openFolderModal,
        openTaskModal,
    });

    const [activeDrag, setActiveDrag] = useState<{ id: string; data: DragPayload } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { enabledStatuses, sortPreset, hasStatusFilter, toggleStatus, setSortPreset } = useTreeFilters();

    /** При появлении непустого поиска раскрываем дерево, чтобы совпадения были видны */
    useEffect(() => {
        if (searchQuery.trim()) {
            expandAll();
        }
    }, [searchQuery, expandAll]);

    useTreeDeepLink({
        loading,
        initialDeepLink,
        areas,
        foldersByArea,
        foldersByParent,
        tasksByArea,
        tasksByFolder,
        setExpandedAreas,
        setExpandedFolders,
        loadAreaContent,
        loadFolderContent,
        openAreaModal,
        openFolderModal,
        openTaskModal,
        showError,
        handleAreaSave: handlers.handleAreaSave,
        handleAreaDelete: handlers.handleAreaDelete ?? (() => Promise.resolve()),
        handleFolderSave: handlers.handleFolderSave,
        handleFolderDelete: handlers.handleFolderDelete ?? (() => Promise.resolve()),
        handleTaskSave: handlers.handleTaskSave,
        handleTaskDelete: handlers.handleTaskDelete ?? (() => Promise.resolve()),
    });

    const handleDragEndCallback = useTreeDragEnd({
        foldersByArea,
        foldersByParent,
        setFoldersByArea,
        setFoldersByParent,
        setTasksByArea,
        setTasksByFolder,
        setExpandedFolders,
        setAreas,
        loadFolderContent,
        showError,
        addSuccess,
        notifyTaskUpdate,
    });

    const filterAndSortTasks = useCallback(
        (tasks: import('../../../../types').TaskSummary[]) => {
            const filtered = hasStatusFilter ? filterTasksByStatus(tasks, enabledStatuses) : tasks;
            return sortTasks(filtered, sortPreset);
        },
        [enabledStatuses, sortPreset, hasStatusFilter]
    );

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
    );

    const handleDragStart = useCallback((event: DragStartEvent) => {
        const { active } = event;
        const data = active.data.current as DragPayload | undefined;
        if (data) setActiveDrag({ id: active.id as string, data });
    }, []);

    const handleDragEnd = useCallback(
        async (event: DragEndEvent) => {
            setActiveDrag(null);
            await handleDragEndCallback(event);
        },
        [handleDragEndCallback]
    );

    // Construct Context Value
    const contextValue = useMemo(() => ({
        // Data
        areas,
        foldersByArea,
        foldersByParent,
        tasksByArea,
        tasksByFolder,
        expandedAreas,
        expandedFolders,
        loadingContent,
        activeDrag,

        // Actions
        actions: {
            toggleArea,
            toggleFolder,
            onViewAreaDetails: handlers.handleViewAreaDetails,
            onCreateFolderForArea: handlers.handleCreateFolderForArea,
            onCreateTaskForArea: handlers.handleCreateTaskForArea,
            onViewFolderDetails: handlers.handleViewFolderDetails,
            onCreateFolderForFolder: handlers.handleCreateFolderForFolder,
            onCreateTaskForFolder: handlers.handleCreateTaskForFolder,
            onViewTaskDetails: handlers.handleViewTaskDetails,
            onSetAreaColor: handlers.handleSetAreaColor,
        },

        // Helpers
        helpers: {
            filterAndSortTasks,
            hasStatusFilter,
            searchQuery,
        }
    }), [
        areas,
        foldersByArea,
        foldersByParent,
        tasksByArea,
        tasksByFolder,
        expandedAreas,
        expandedFolders,
        loadingContent,
        activeDrag,
        toggleArea,
        toggleFolder,
        handlers,
        filterAndSortTasks,
        hasStatusFilter,
        searchQuery,
    ]);

    // Render specific root content if provided
    const renderRootContent = () => {
        if (root?.type === 'area') {
            const areaId = root.id;
            const query = searchQuery.trim();
            let folders = foldersByArea.get(areaId) ?? [];
            let rawTasks = tasksByArea.get(areaId) ?? [];
            if (query) {
                folders = folders.filter((f) => folderHasMatch(f, query, foldersByParent, tasksByFolder));
                rawTasks = rawTasks.filter((t) => matchesSearch(t.title, query));
            }
            const tasks = filterAndSortTasks(rawTasks);

            if (query && folders.length === 0 && tasks.length === 0) {
                return (
                    <div className={css.rootContainer}>
                        <div className={glassWidgetStyles.placeholder}>Ничего не найдено</div>
                    </div>
                );
            }

            return (
                <div className={css.rootContainer}>
                    <TreeAreaChildren
                        areaId={areaId}
                        folders={folders}
                        tasks={tasks}
                        onViewTaskDetails={handlers.handleViewTaskDetails}
                    />
                </div>
            );
        }

        if (root?.type === 'folder') {
            const folderId = root.id;
            const query = searchQuery.trim();
            let subfolders = foldersByParent.get(folderId) ?? [];
            let rawTasks = tasksByFolder.get(folderId) ?? [];
            if (query) {
                subfolders = subfolders.filter((f) => folderHasMatch(f, query, foldersByParent, tasksByFolder));
                rawTasks = rawTasks.filter((t) => matchesSearch(t.title, query));
            }
            const tasks = filterAndSortTasks(rawTasks);

            if (query && subfolders.length === 0 && tasks.length === 0) {
                return (
                    <div className={css.rootContainer}>
                        <div className={glassWidgetStyles.placeholder}>Ничего не найдено</div>
                    </div>
                );
            }

            return (
                <div className={css.rootContainer}>
                    <TreeFolderChildren
                        subfolders={subfolders}
                        tasks={tasks}
                        areaId={root.areaId ?? ''}
                        depth={0}
                        onViewTaskDetails={handlers.handleViewTaskDetails}
                    />
                </div>
            );
        }

        // Default: render full tree
        if (areas.length === 0) {
            return <TreeEmpty />;
        }
        return <TreeContent />;
    };

    return (
        <TreeProvider value={contextValue}>
            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetection}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setActiveDrag(null)}
            >
                <div className={`${css.tree} ${className || ''}`}>
                    <TreeToolbar
                        onCreateArea={!root ? handlers.handleCreateArea : undefined} // Only allow creating area if we are at root
                        isAllExpanded={isAllExpanded}
                        onExpandAll={expandAll}
                        onCollapseAll={collapseAll}
                        enabledStatuses={enabledStatuses}
                        toggleStatus={toggleStatus}
                        sortPreset={sortPreset}
                        setSortPreset={setSortPreset}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />
                    {activeDrag && <div className={css.dragHint}>Переместите в папку или область</div>}
                    <div className={`${css.widgetContent} scrollbar-compact`}>
                        {loading ? (
                            <div className={glassWidgetStyles.placeholder}><Loader size="m" ariaLabel="Загрузка" /></div>
                        ) : (
                            renderRootContent()
                        )}
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
                    document.body
                )}
            </DndContext>
        </TreeProvider>
    );
};
