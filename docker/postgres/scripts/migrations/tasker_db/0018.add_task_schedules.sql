create table if not exists task_schedules (
    id uuid primary key,
    task_id uuid not null references tasks(id) on delete restrict,
    start_at timestamptz not null,
    end_at timestamptz not null,
    created_at timestamptz not null,
    updated_at timestamptz not null,
    owner_user_id uuid not null,
    is_active boolean not null default true,
    deactivated_at timestamptz
);

create index ix_task_schedules_task_id on task_schedules (task_id);
create index ix_task_schedules_range on task_schedules (start_at, end_at) where is_active = true;
create index ix_task_schedules_owner_user_id on task_schedules (owner_user_id);

COMMENT ON TABLE task_schedules IS 'Расписание задач (привязка задач к временным слотам)';
COMMENT ON COLUMN task_schedules.id IS 'Идентификатор записи расписания';
COMMENT ON COLUMN task_schedules.task_id IS 'Идентификатор задачи';
COMMENT ON COLUMN task_schedules.start_at IS 'Дата и время начала';
COMMENT ON COLUMN task_schedules.end_at IS 'Дата и время окончания';
COMMENT ON COLUMN task_schedules.created_at IS 'Дата создания записи';
COMMENT ON COLUMN task_schedules.updated_at IS 'Дата последнего обновления записи';
COMMENT ON COLUMN task_schedules.owner_user_id IS 'Идентификатор пользователя-владельца';
COMMENT ON COLUMN task_schedules.is_active IS 'Флаг активности (false - удалено)';
COMMENT ON COLUMN task_schedules.deactivated_at IS 'Дата деактивации (удаления)';
