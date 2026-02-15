import type { FolderSummary, TaskSummary } from '../../../../types';

/**
 * Finds the parent ID and type for a given entity ID (task or folder) by searching through the current tree state.
 * Used for Granular Updates to determine which container needs refreshing.
 */
export function findParentForEntity(
    entityId: string,
    isFolder: boolean,
    foldersByParent: Map<string, FolderSummary[]>,
    foldersByArea: Map<string, FolderSummary[]>,
    tasksByFolder: Map<string, TaskSummary[]>,
    tasksByArea: Map<string, TaskSummary[]>
): { type: 'folder' | 'area'; id: string } | null {
    if (isFolder) {
        // Search in Folders (as children)
        for (const [pId, folders] of Array.from(foldersByParent.entries())) {
            if (folders.some(f => f.id === entityId)) {
                return { type: 'folder', id: pId };
            }
        }
        for (const [areaId, folders] of Array.from(foldersByArea.entries())) {
            if (folders.some(f => f.id === entityId)) {
                return { type: 'area', id: areaId };
            }
        }
    } else {
        // Search in Tasks
        for (const [pId, tasks] of Array.from(tasksByFolder.entries())) {
            if (tasks.some(t => t.id === entityId)) {
                return { type: 'folder', id: pId };
            }
        }
        for (const [areaId, tasks] of Array.from(tasksByArea.entries())) {
            if (tasks.some(t => t.id === entityId)) {
                return { type: 'area', id: areaId };
            }
        }
    }
    return null;
}
