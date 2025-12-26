create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deactivated_at timestamptz,
    is_active boolean not null default true
);
comment on table users is 'Пользователи';
comment on column users.id is 'ID пользователя';
comment on column users.name is 'Имя пользователя';
comment on column users.created_at is 'Дата создания';
comment on column users.updated_at is 'Дата обновления';
comment on column users.deactivated_at is 'Дата деактивации';
comment on column users.is_active is 'Признак активности';

create table if not exists user_logs (
    id serial primary key,
    user_id uuid references users(id),
    ip_address text,
    user_agent text,
    http_method text not null,
    endpoint text not null,
    request_params jsonb,
    response_code int,
    error_message text,
    created_at timestamptz not null default now()
);
comment on table user_logs is 'Логи действий пользователей';
comment on column user_logs.id is 'Уникальный идентификатор лога';
comment on column user_logs.user_id is 'ID пользователя, совершившего действие';
comment on column user_logs.ip_address is 'IP-адрес пользователя';
comment on column user_logs.user_agent is 'User-Agent браузера или клиента';
comment on column user_logs.http_method is 'HTTP-метод запроса';
comment on column user_logs.endpoint is 'Конечная точка (endpoint) запроса';
comment on column user_logs.request_params is 'Параметры запроса в формате JSON';
comment on column user_logs.response_code is 'Код ответа сервера';
comment on column user_logs.error_message is 'Сообщение об ошибке, если есть';
comment on column user_logs.created_at is 'Дата и время создания записи';

create table if not exists areas (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    creator_user_id uuid not null references users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deactivated_at timestamptz,
    is_active boolean not null default true
);
comment on table areas is 'Области';
comment on column areas.id is 'ID области';
comment on column areas.title is 'Заголовок области';
comment on column areas.description is 'Описание области';
comment on column areas.creator_user_id is 'ID создателя';
comment on column areas.created_at is 'Дата создания';
comment on column areas.updated_at is 'Дата обновления';
comment on column areas.deactivated_at is 'Дата деактивации';
comment on column areas.is_active is 'Признак активности';

create table if not exists groups (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    creator_user_id uuid not null references users(id),
    area_id uuid not null references areas(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deactivated_at timestamptz,
    is_active boolean not null default true
);
comment on table groups is 'Группы';
comment on column groups.id is 'ID группы';
comment on column groups.title is 'Заголовок группы';
comment on column groups.description is 'Описание группы';
comment on column groups.creator_user_id is 'ID создателя';
comment on column groups.area_id is 'ID области';
comment on column groups.created_at is 'Дата создания';
comment on column groups.updated_at is 'Дата обновления';
comment on column groups.deactivated_at is 'Дата деактивации';
comment on column groups.is_active is 'Признак активности';

create table if not exists tasks (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    creator_user_id uuid not null references users(id),
    group_id uuid not null references groups(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deactivated_at timestamptz,
    is_active boolean not null default true
);
comment on table tasks is 'Задачи';
comment on column tasks.id is 'ID задачи';
comment on column tasks.title is 'Заголовок задачи';
comment on column tasks.description is 'Описание задачи';
comment on column tasks.creator_user_id is 'ID создателя';
comment on column tasks.group_id is 'ID группы';
comment on column tasks.created_at is 'Дата создания';
comment on column tasks.updated_at is 'Дата обновления';
comment on column tasks.deactivated_at is 'Дата деактивации';
comment on column tasks.is_active is 'Признак активности';

create table if not exists subtasks (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    creator_user_id uuid not null references users(id),
    task_id uuid not null references tasks(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deactivated_at timestamptz,
    is_active boolean not null default true
);
comment on table subtasks is 'Подзадачи';
comment on column subtasks.id is 'ID подзадачи';
comment on column subtasks.title is 'Заголовок подзадачи';
comment on column subtasks.description is 'Описание подзадачи';
comment on column subtasks.creator_user_id is 'ID создателя';
comment on column subtasks.task_id is 'ID задачи';
comment on column subtasks.created_at is 'Дата создания';
comment on column subtasks.updated_at is 'Дата обновления';
comment on column subtasks.deactivated_at is 'Дата деактивации';
comment on column subtasks.is_active is 'Признак активности';

create table if not exists purposes (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    creator_user_id uuid not null references users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deactivated_at timestamptz,
    is_active boolean not null default true
);
comment on table purposes is 'Цели';
comment on column purposes.id is 'ID цели';
comment on column purposes.title is 'Заголовок цели';
comment on column purposes.description is 'Описание цели';
comment on column purposes.creator_user_id is 'ID создателя';
comment on column purposes.created_at is 'Дата создания';
comment on column purposes.updated_at is 'Дата обновления';
comment on column purposes.deactivated_at is 'Дата деактивации';
comment on column purposes.is_active is 'Признак активности';

create table if not exists events (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text,
    creator_user_id uuid not null references users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deactivated_at timestamptz,
    is_active boolean not null default true
);
comment on table events is 'События';
comment on column events.id is 'ID события';
comment on column events.title is 'Заголовок события';
comment on column events.description is 'Описание события';
comment on column events.creator_user_id is 'ID создателя';
comment on column events.created_at is 'Дата создания';
comment on column events.updated_at is 'Дата обновления';
comment on column events.deactivated_at is 'Дата деактивации';
comment on column events.is_active is 'Признак активности';

create table if not exists events_2_task ( 
    event_id uuid not null references events(id),
    task_id uuid not null references tasks(id),
    creator_user_id uuid not null references users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deactivated_at timestamptz,
    is_active boolean not null default true
);
create unique index if not exists unique_active_event_task 
    on events_2_task(event_id, task_id) 
    where is_active = true;
create index if not exists idx_events_2_task_event_id on events_2_task(event_id);
create index if not exists idx_events_2_task_task_id on events_2_task(task_id);
create index if not exists idx_events_2_task_creator_user_id on events_2_task(creator_user_id);
create index if not exists idx_events_2_task_is_active on events_2_task(is_active);
comment on table events_2_task is 'События - задачи';
comment on column events_2_task.event_id is 'ID события';
comment on column events_2_task.task_id is 'ID задачи';
comment on column events_2_task.creator_user_id is 'ID создателя';
comment on column events_2_task.created_at is 'Дата создания';
comment on column events_2_task.updated_at is 'Дата обновления';
comment on column events_2_task.deactivated_at is 'Дата деактивации';
comment on column events_2_task.is_active is 'Признак активности';

create table if not exists events_2_subtask (
    event_id uuid not null references events(id),
    subtask_id uuid not null references subtasks(id),
    creator_user_id uuid not null references users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deactivated_at timestamptz,
    is_active boolean not null default true
);
create unique index if not exists unique_active_event_subtask 
    on events_2_subtask(event_id, subtask_id) 
    where is_active = true;
create index if not exists idx_events_2_subtask_event_id on events_2_subtask(event_id);
create index if not exists idx_events_2_subtask_subtask_id on events_2_subtask(subtask_id);
create index if not exists idx_events_2_subtask_creator_user_id on events_2_subtask(creator_user_id);
create index if not exists idx_events_2_subtask_is_active on events_2_subtask(is_active);
comment on table events_2_subtask is 'События - подзадачи';
comment on column events_2_subtask.event_id is 'ID события';
comment on column events_2_subtask.subtask_id is 'ID подзадачи';
comment on column events_2_subtask.creator_user_id is 'ID создателя';
comment on column events_2_subtask.created_at is 'Дата создания';
comment on column events_2_subtask.updated_at is 'Дата обновления';
comment on column events_2_subtask.deactivated_at is 'Дата деактивации';
comment on column events_2_subtask.is_active is 'Признак активности';

create table if not exists events_2_group (
    event_id uuid not null references events(id),
    group_id uuid not null references groups(id),
    creator_user_id uuid not null references users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deactivated_at timestamptz,
    is_active boolean not null default true
);
create unique index if not exists unique_active_event_group 
    on events_2_group(event_id, group_id) 
    where is_active = true;
create index if not exists idx_events_2_group_event_id on events_2_group(event_id);
create index if not exists idx_events_2_group_group_id on events_2_group(group_id);
create index if not exists idx_events_2_group_creator_user_id on events_2_group(creator_user_id);
create index if not exists idx_events_2_group_is_active on events_2_group(is_active);
comment on table events_2_group is 'События - группы';
comment on column events_2_group.event_id is 'ID события';
comment on column events_2_group.group_id is 'ID группы';
comment on column events_2_group.creator_user_id is 'ID создателя';
comment on column events_2_group.created_at is 'Дата создания';
comment on column events_2_group.updated_at is 'Дата обновления';
comment on column events_2_group.deactivated_at is 'Дата деактивации';
comment on column events_2_group.is_active is 'Признак активности';

create table if not exists events_2_area (
    event_id uuid not null references events(id),
    area_id uuid not null references areas(id),
    creator_user_id uuid not null references users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deactivated_at timestamptz,
    is_active boolean not null default true
);
create unique index if not exists unique_active_event_area 
    on events_2_area(event_id, area_id) 
    where is_active = true;
create index if not exists idx_events_2_area_event_id on events_2_area(event_id);
create index if not exists idx_events_2_area_area_id on events_2_area(area_id);
create index if not exists idx_events_2_area_creator_user_id on events_2_area(creator_user_id);
create index if not exists idx_events_2_area_is_active on events_2_area(is_active);
comment on table events_2_area is 'События - области';
comment on column events_2_area.event_id is 'ID события';
comment on column events_2_area.area_id is 'ID области';
comment on column events_2_area.creator_user_id is 'ID создателя';
comment on column events_2_area.created_at is 'Дата создания';
comment on column events_2_area.updated_at is 'Дата обновления';
comment on column events_2_area.deactivated_at is 'Дата деактивации';
comment on column events_2_area.is_active is 'Признак активности';

create table if not exists events_2_purpose (
    event_id uuid not null references events(id),
    purpose_id uuid not null references purposes(id),
    creator_user_id uuid not null references users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deactivated_at timestamptz,
    is_active boolean not null default true
);
create unique index if not exists unique_active_event_purpose 
    on events_2_purpose(event_id, purpose_id) 
    where is_active = true;
create index if not exists idx_events_2_purpose_event_id on events_2_purpose(event_id);
create index if not exists idx_events_2_purpose_purpose_id on events_2_purpose(purpose_id);
create index if not exists idx_events_2_purpose_creator_user_id on events_2_purpose(creator_user_id);
create index if not exists idx_events_2_purpose_is_active on events_2_purpose(is_active);
comment on table events_2_purpose is 'События - цели';
comment on column events_2_purpose.event_id is 'ID события';
comment on column events_2_purpose.purpose_id is 'ID цели';
comment on column events_2_purpose.creator_user_id is 'ID создателя';
comment on column events_2_purpose.created_at is 'Дата создания';
comment on column events_2_purpose.updated_at is 'Дата обновления';
comment on column events_2_purpose.deactivated_at is 'Дата деактивации';
comment on column events_2_purpose.is_active is 'Признак активности';