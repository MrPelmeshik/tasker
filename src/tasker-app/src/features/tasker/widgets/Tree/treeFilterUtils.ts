import type { TaskSummary } from '../../../../types';
import type { TaskStatus } from '../../../../types/task-status';

export type TreeSortPreset =
  | 'statusAscAlpha'
  | 'statusDescAlpha'
  | 'alpha'
  | 'alphaDesc'
  | 'createdAtAsc'
  | 'createdAtDesc'
  | 'updatedAtAsc'
  | 'updatedAtDesc';

const STATUS_PRIORITY_ORDER: TaskStatus[] = [
  3 /* InProgress */,
  2 /* Pending */,
  1 /* New */,
  4 /* Closed */,
  5 /* Cancelled */,
];

function getStatusPriority(status: number): number {
  const idx = STATUS_PRIORITY_ORDER.indexOf(status as TaskStatus);
  return idx >= 0 ? idx : STATUS_PRIORITY_ORDER.length;
}

export function filterTasksByStatus(
  tasks: TaskSummary[],
  enabledStatuses: Set<TaskStatus>
): TaskSummary[] {
  if (enabledStatuses.size === 0) return [];
  return tasks.filter((t) => enabledStatuses.has((t.status as TaskStatus) ?? 0));
}

export function sortTasks(tasks: TaskSummary[], preset: TreeSortPreset): TaskSummary[] {
  const result = [...tasks];

  switch (preset) {
    case 'statusAscAlpha':
      result.sort((a, b) => {
        const pa = getStatusPriority(a.status);
        const pb = getStatusPriority(b.status);
        if (pa !== pb) return pa - pb;
        return (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' });
      });
      break;
    case 'statusDescAlpha':
      result.sort((a, b) => {
        const pa = getStatusPriority(a.status);
        const pb = getStatusPriority(b.status);
        if (pa !== pb) return pa - pb;
        return (b.title ?? '').localeCompare(a.title ?? '', undefined, { sensitivity: 'base' });
      });
      break;
    case 'alpha':
      result.sort((a, b) =>
        (a.title ?? '').localeCompare(b.title ?? '', undefined, { sensitivity: 'base' })
      );
      break;
    case 'alphaDesc':
      result.sort((a, b) =>
        (b.title ?? '').localeCompare(a.title ?? '', undefined, { sensitivity: 'base' })
      );
      break;
    case 'createdAtAsc':
      result.sort((a, b) => {
        const da = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const db = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return da - db;
      });
      break;
    case 'createdAtDesc':
      result.sort((a, b) => {
        const da = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
        const db = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;
        return db - da;
      });
      break;
    case 'updatedAtAsc':
      result.sort((a, b) => {
        const da = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
        const db = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
        return da - db;
      });
      break;
    case 'updatedAtDesc':
      result.sort((a, b) => {
        const da = a.updatedAt instanceof Date ? a.updatedAt.getTime() : 0;
        const db = b.updatedAt instanceof Date ? b.updatedAt.getTime() : 0;
        return db - da;
      });
      break;
    default:
      break;
  }

  return result;
}

export const TREE_SORT_PRESET_OPTIONS: { value: TreeSortPreset; label: string }[] = [
  { value: 'statusAscAlpha', label: 'По статусу (активные первыми), A→Z' },
  { value: 'statusDescAlpha', label: 'По статусу (активные первыми), Z→A' },
  { value: 'alpha', label: 'По алфавиту A→Z' },
  { value: 'alphaDesc', label: 'По алфавиту Z→A' },
  { value: 'createdAtAsc', label: 'По дате создания ↑' },
  { value: 'createdAtDesc', label: 'По дате создания ↓' },
  { value: 'updatedAtAsc', label: 'По дате изменения ↑' },
  { value: 'updatedAtDesc', label: 'По дате изменения ↓' },
];
