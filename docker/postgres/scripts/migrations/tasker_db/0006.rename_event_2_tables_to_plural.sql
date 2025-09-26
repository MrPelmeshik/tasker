-- Переименование таблиц event_2_... в формат с множественным числом с обеих сторон от двойки
-- Миграция: 0006.rename_event_2_tables_to_plural.sql

-- Переименование events_2_task в events_2_tasks
ALTER TABLE events_2_task RENAME TO events_2_tasks;

-- Переименование индексов для events_2_tasks
ALTER INDEX unique_active_event_task RENAME TO unique_active_event_tasks;
ALTER INDEX idx_events_2_task_event_id RENAME TO idx_events_2_tasks_event_id;
ALTER INDEX idx_events_2_task_task_id RENAME TO idx_events_2_tasks_task_id;
ALTER INDEX idx_events_2_task_creator_user_id RENAME TO idx_events_2_tasks_creator_user_id;
ALTER INDEX idx_events_2_task_is_active RENAME TO idx_events_2_tasks_is_active;

-- Обновление комментариев для events_2_tasks
COMMENT ON TABLE events_2_tasks IS 'События - задачи';
COMMENT ON COLUMN events_2_tasks.event_id IS 'ID события';
COMMENT ON COLUMN events_2_tasks.task_id IS 'ID задачи';
COMMENT ON COLUMN events_2_tasks.creator_user_id IS 'ID создателя';
COMMENT ON COLUMN events_2_tasks.created_at IS 'Дата создания';
COMMENT ON COLUMN events_2_tasks.updated_at IS 'Дата обновления';
COMMENT ON COLUMN events_2_tasks.deactivated_at IS 'Дата деактивации';
COMMENT ON COLUMN events_2_tasks.is_active IS 'Признак активности';

-- Переименование events_2_subtask в events_2_subtasks
ALTER TABLE events_2_subtask RENAME TO events_2_subtasks;

-- Переименование индексов для events_2_subtasks
ALTER INDEX unique_active_event_subtask RENAME TO unique_active_event_subtasks;
ALTER INDEX idx_events_2_subtask_event_id RENAME TO idx_events_2_subtasks_event_id;
ALTER INDEX idx_events_2_subtask_subtask_id RENAME TO idx_events_2_subtasks_subtask_id;
ALTER INDEX idx_events_2_subtask_creator_user_id RENAME TO idx_events_2_subtasks_creator_user_id;
ALTER INDEX idx_events_2_subtask_is_active RENAME TO idx_events_2_subtasks_is_active;

-- Обновление комментариев для events_2_subtasks
COMMENT ON TABLE events_2_subtasks IS 'События - подзадачи';
COMMENT ON COLUMN events_2_subtasks.event_id IS 'ID события';
COMMENT ON COLUMN events_2_subtasks.subtask_id IS 'ID подзадачи';
COMMENT ON COLUMN events_2_subtasks.creator_user_id IS 'ID создателя';
COMMENT ON COLUMN events_2_subtasks.created_at IS 'Дата создания';
COMMENT ON COLUMN events_2_subtasks.updated_at IS 'Дата обновления';
COMMENT ON COLUMN events_2_subtasks.deactivated_at IS 'Дата деактивации';
COMMENT ON COLUMN events_2_subtasks.is_active IS 'Признак активности';

-- Переименование events_2_group в events_2_groups
ALTER TABLE events_2_group RENAME TO events_2_groups;

-- Переименование индексов для events_2_groups
ALTER INDEX unique_active_event_group RENAME TO unique_active_event_groups;
ALTER INDEX idx_events_2_group_event_id RENAME TO idx_events_2_groups_event_id;
ALTER INDEX idx_events_2_group_group_id RENAME TO idx_events_2_groups_group_id;
ALTER INDEX idx_events_2_group_creator_user_id RENAME TO idx_events_2_groups_creator_user_id;
ALTER INDEX idx_events_2_group_is_active RENAME TO idx_events_2_groups_is_active;

-- Обновление комментариев для events_2_groups
COMMENT ON TABLE events_2_groups IS 'События - группы';
COMMENT ON COLUMN events_2_groups.event_id IS 'ID события';
COMMENT ON COLUMN events_2_groups.group_id IS 'ID группы';
COMMENT ON COLUMN events_2_groups.creator_user_id IS 'ID создателя';
COMMENT ON COLUMN events_2_groups.created_at IS 'Дата создания';
COMMENT ON COLUMN events_2_groups.updated_at IS 'Дата обновления';
COMMENT ON COLUMN events_2_groups.deactivated_at IS 'Дата деактивации';
COMMENT ON COLUMN events_2_groups.is_active IS 'Признак активности';

-- Переименование events_2_area в events_2_areas
ALTER TABLE events_2_area RENAME TO events_2_areas;

-- Переименование индексов для events_2_areas
ALTER INDEX unique_active_event_area RENAME TO unique_active_event_areas;
ALTER INDEX idx_events_2_area_event_id RENAME TO idx_events_2_areas_event_id;
ALTER INDEX idx_events_2_area_area_id RENAME TO idx_events_2_areas_area_id;
ALTER INDEX idx_events_2_area_creator_user_id RENAME TO idx_events_2_areas_creator_user_id;
ALTER INDEX idx_events_2_area_is_active RENAME TO idx_events_2_areas_is_active;

-- Обновление комментариев для events_2_areas
COMMENT ON TABLE events_2_areas IS 'События - области';
COMMENT ON COLUMN events_2_areas.event_id IS 'ID события';
COMMENT ON COLUMN events_2_areas.area_id IS 'ID области';
COMMENT ON COLUMN events_2_areas.creator_user_id IS 'ID создателя';
COMMENT ON COLUMN events_2_areas.created_at IS 'Дата создания';
COMMENT ON COLUMN events_2_areas.updated_at IS 'Дата обновления';
COMMENT ON COLUMN events_2_areas.deactivated_at IS 'Дата деактивации';
COMMENT ON COLUMN events_2_areas.is_active IS 'Признак активности';

-- Переименование events_2_purpose в events_2_purposes
ALTER TABLE events_2_purpose RENAME TO events_2_purposes;

-- Переименование индексов для events_2_purposes
ALTER INDEX unique_active_event_purpose RENAME TO unique_active_event_purposes;
ALTER INDEX idx_events_2_purpose_event_id RENAME TO idx_events_2_purposes_event_id;
ALTER INDEX idx_events_2_purpose_purpose_id RENAME TO idx_events_2_purposes_purpose_id;
ALTER INDEX idx_events_2_purpose_creator_user_id RENAME TO idx_events_2_purposes_creator_user_id;
ALTER INDEX idx_events_2_purpose_is_active RENAME TO idx_events_2_purposes_is_active;

-- Обновление комментариев для events_2_purposes
COMMENT ON TABLE events_2_purposes IS 'События - цели';
COMMENT ON COLUMN events_2_purposes.event_id IS 'ID события';
COMMENT ON COLUMN events_2_purposes.purpose_id IS 'ID цели';
COMMENT ON COLUMN events_2_purposes.creator_user_id IS 'ID создателя';
COMMENT ON COLUMN events_2_purposes.created_at IS 'Дата создания';
COMMENT ON COLUMN events_2_purposes.updated_at IS 'Дата обновления';
COMMENT ON COLUMN events_2_purposes.deactivated_at IS 'Дата деактивации';
COMMENT ON COLUMN events_2_purposes.is_active IS 'Признак активности';
