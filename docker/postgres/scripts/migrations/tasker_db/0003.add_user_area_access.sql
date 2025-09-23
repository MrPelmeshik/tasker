-- Таблица для управления правами доступа пользователей к областям
create table if not exists user_area_access (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references users(id),
    area_id uuid not null references areas(id),
    granted_by_user_id uuid not null references users(id),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    deactivated_at timestamptz,
    is_active boolean not null default true
);

-- Уникальный индекс для активных записей доступа
create unique index if not exists unique_active_user_area_access 
    on user_area_access(user_id, area_id) 
    where is_active = true;

-- Индексы для оптимизации запросов
create index if not exists idx_user_area_access_user_id on user_area_access(user_id);
create index if not exists idx_user_area_access_area_id on user_area_access(area_id);
create index if not exists idx_user_area_access_granted_by_user_id on user_area_access(granted_by_user_id);
create index if not exists idx_user_area_access_is_active on user_area_access(is_active);

-- Комментарии к таблице и колонкам
comment on table user_area_access is 'Права доступа пользователей к областям';
comment on column user_area_access.id is 'ID записи доступа';
comment on column user_area_access.user_id is 'ID пользователя';
comment on column user_area_access.area_id is 'ID области';
comment on column user_area_access.granted_by_user_id is 'ID пользователя, предоставившего доступ';
comment on column user_area_access.created_at is 'Дата создания';
comment on column user_area_access.updated_at is 'Дата обновления';
comment on column user_area_access.deactivated_at is 'Дата деактивации';
comment on column user_area_access.is_active is 'Признак активности';
