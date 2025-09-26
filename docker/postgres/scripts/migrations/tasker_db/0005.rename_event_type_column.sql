-- Переименовываем колонку type в event_type в таблице events
alter table events rename column type to event_type;

-- Переименовываем индекс для соответствия новому названию колонки
drop index if exists idx_events_type;
create index if not exists idx_events_event_type on events(event_type);

-- Обновляем комментарий к колонке
comment on column events.event_type is 'Тип события (0=CREATE, 1=UPDATE, 2=DELETE, 3=NOTE, 4=ACTIVITY)';
