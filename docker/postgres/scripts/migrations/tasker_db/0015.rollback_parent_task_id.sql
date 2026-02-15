-- Откат миграции 0014: удаление parent_task_id
-- 1. Переприкрепить подзадачи к папкам родителей (или корню области)
UPDATE tasks child
SET folder_id = parent.folder_id,
    parent_task_id = NULL
FROM tasks parent
WHERE child.parent_task_id = parent.id;

-- 2. Удалить индекс, FK-constraint и колонку
DROP INDEX IF EXISTS ix_tasks_parent_task_id;

ALTER TABLE tasks
DROP CONSTRAINT IF EXISTS fk_tasks_parent_task_id;

ALTER TABLE tasks
DROP COLUMN IF EXISTS parent_task_id;
