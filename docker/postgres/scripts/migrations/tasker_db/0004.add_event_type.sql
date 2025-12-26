-- Добавляем колонку type в таблицу events как integer
alter table events add column if not exists type integer not null default 0;

-- Добавляем комментарий к колонке
comment on column events.type is 'Тип события (0=CREATE, 1=UPDATE, 2=DELETE, 3=NOTE, 4=ACTIVITY)';

-- Создаем индекс для быстрого поиска по типу события
create index if not exists idx_events_type on events(type);
