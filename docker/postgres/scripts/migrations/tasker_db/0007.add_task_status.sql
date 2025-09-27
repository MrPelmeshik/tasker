-- Добавление поля статуса для задач
-- Миграция: 0007.add_task_status.sql

-- Добавление колонки status в таблицу tasks
ALTER TABLE tasks ADD COLUMN status integer NOT NULL DEFAULT 1;

-- Добавление комментария к колонке
COMMENT ON COLUMN tasks.status IS 'Статус задачи: 1 - Новая, 2 - В ожидании, 3 - В работе, 4 - Закрыта, 5 - Отменена';

-- Создание индекса для статуса (для быстрого поиска по статусу)
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Обновление существующих записей (если есть) - устанавливаем статус "Новая" для всех существующих задач
UPDATE tasks SET status = 1 WHERE status IS NULL;
