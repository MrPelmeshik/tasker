import type { FolderSummary, TaskSummary } from '../../../../types';

/**
 * Проверяет, совпадает ли название с поисковым запросом (без учёта регистра, по вхождению подстроки).
 */
export function matchesSearch(title: string | undefined, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const t = (title ?? '').toLowerCase();
  return t.includes(q);
}

/**
 * Рекурсивно определяет, есть ли в папке или у её потомков совпадение по поисковому запросу:
 * совпадает название папки, либо хотя бы одна задача в папке, либо хотя бы одна дочерняя папка.
 */
export function folderHasMatch(
  folder: FolderSummary,
  query: string,
  foldersByParent: Map<string, FolderSummary[]>,
  tasksByFolder: Map<string, TaskSummary[]>
): boolean {
  // If query is empty, show everything (or nothing depending on usage, but typically empty query means no filter)
  if (!query.trim()) return true;

  // Check tasks in this folder
  const tasks = tasksByFolder.get(folder.id) ?? [];
  if (tasks.some((t) => matchesSearch(t.title, query))) return true;

  // Check subfolders recursively
  const children = foldersByParent.get(folder.id) ?? [];
  return children.some((child) => folderHasMatch(child, query, foldersByParent, tasksByFolder));
}
