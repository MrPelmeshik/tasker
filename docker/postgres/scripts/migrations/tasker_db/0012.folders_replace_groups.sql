-- Замена групп на папки с поддержкой вложенности
-- Миграция: 0012.folders_replace_groups.sql
-- Папки: area_id, parent_folder_id (nullable). Задачи: area_id (обязательно), folder_id (nullable).

-- 1. Создать таблицу folders
create table if not exists folders (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    owner_user_id uuid not null references users(id),
    area_id uuid not null references areas(id),
    parent_folder_id uuid references folders(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deactivated_at timestamptz,
    is_active boolean not null default true
);
comment on table folders is 'Папки';
comment on column folders.id is 'ID папки';
comment on column folders.title is 'Заголовок папки';
comment on column folders.description is 'Описание папки';
comment on column folders.owner_user_id is 'ID владельца';
comment on column folders.area_id is 'ID области';
comment on column folders.parent_folder_id is 'ID родительской папки (null = корень области)';
comment on column folders.created_at is 'Дата создания';
comment on column folders.updated_at is 'Дата обновления';
comment on column folders.deactivated_at is 'Дата деактивации';
comment on column folders.is_active is 'Признак активности';

create index if not exists idx_folders_area_id on folders(area_id);
create index if not exists idx_folders_parent_folder_id on folders(parent_folder_id);

-- 2. Добавить area_id и folder_id в tasks
alter table tasks add column if not exists area_id uuid references areas(id);
alter table tasks add column if not exists folder_id uuid references folders(id);

-- 3. Миграция данных: создать папки из групп
insert into folders (id, title, description, owner_user_id, area_id, parent_folder_id, created_at, updated_at, deactivated_at, is_active)
select id, title, description, owner_user_id, area_id, null, created_at, updated_at, deactivated_at, is_active
from groups;

-- 4. Обновить задачи: area_id и folder_id
update tasks t
set area_id = g.area_id,
    folder_id = g.id
from groups g
where t.group_id = g.id;

-- 5. Удалить FK tasks -> groups
alter table tasks drop constraint if exists tasks_group_id_fkey;

-- 6. Удалить events_2_groups
drop table if exists events_2_groups cascade;

-- 7. Удалить groups
drop table if exists groups cascade;

-- 8. Удалить group_id, сделать area_id NOT NULL, folder_id остаётся nullable
alter table tasks drop column if exists group_id;
alter table tasks alter column area_id set not null;

-- Индексы для tasks
create index if not exists idx_tasks_area_id on tasks(area_id);
create index if not exists idx_tasks_folder_id on tasks(folder_id);

comment on column tasks.area_id is 'ID области';
comment on column tasks.folder_id is 'ID папки (null = в корне области)';
